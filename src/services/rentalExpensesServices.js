import RentalExpensesRepository from "../repository/rentalExpensesRepository.js";
import {sanitizeString} from "../helpers/stringHelpers.js";
import CalculateHelper from "../helpers/calculateTotal.js";

/**
 * Servicio de gastos con lógica de negocio compleja
 * Maneja gastos de los inmuebles y validaciones
 */
export default class RentalExpensesServices {

    /**
     * Obtener todos los registros de gastos
     * @returns {Array} Array con todos los gastos
     */
    static async getAllExpenses() {
        const expenses = await RentalExpensesRepository.getAll();

        // Transforma datos del repositorio a formato de API
        return expenses.map(expense => ({
            id: expense.id,
            expense_number: expense.expense_number,
            property_type: expense.property_type,
            property_name: expense.property_name,
            date: expense.date,
            monthly_rent: expense.monthly_rent,
            electricity: expense.electricity,
            gas: expense.gas,
            water: expense.water,
            community_fees: expense.community_fees,
            insurance: expense.insurance,
            waste_tax: expense.waste_tax,
            others: expense.others,
            total_expenses: expense.total_expenses,
            notes: expense.notes,
            is_refund: expense.is_refund,
            original_expense_id: expense.original_expense_id,
            original_expense_number: expense.original_expense_number,
            payment_status: expense.payment_status || 'pending',
            payment_method: expense.payment_method || 'transfer',
            payment_date: expense.payment_date,
            payment_notes: expense.payment_notes,
            start_date: expense.start_date,
            end_date: expense.end_date,
            corresponding_month: expense.corresponding_month,
            is_proportional: expense.is_proportional,
            date_create: expense.date_create,
            date_update: expense.date_update
        }));
    };

    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================
    /**
     * Obtener gastos filtrados por tipo de propiedad
     * @param {string} propertyType Tipo de propiedad
     * @returns {Array} Array con los gastos encontrados
     */
    static async getByPropertyType(propertyType) {
        if (!propertyType || propertyType.length === 0) return [];
        return RentalExpensesRepository.findByPropertyType(sanitizeString(propertyType));
    };

    /**
     * Obtener gastos filtrados por nombre de propiedad
     * @param {string} propertyName Nombre de la propiedad
     * @returns {Array} Array con los gastos encontrados
     */
    static async getByPropertyName(propertyName) {
        if (!propertyName || propertyName.length === 0) return [];
        return RentalExpensesRepository.findByPropertyName(sanitizeString(propertyName));
    }

    /**
     * Obtener un gasto por su ID
     * @param {number|string} id ID del gasto
     * @returns {Object|Array} Gasto encontrado o array vacío si no existe
     */
    static async getRentalExpenseById(id) {
        if (!id || isNaN(Number(id))) return [];
        return await RentalExpensesRepository.findById(id);
    };

    // ========================================
    // MÉTODOS CRUD
    // ========================================

    /**
     * Crear nuevo gasto de alquiler
     * @param {Object} data Datos del gasto
     * @returns {Array} Gasto creado o vacío si es duplicado o falla
     */
    static async createRentalExpenses(data) {
        //Validar campos obligatorios
        if (!data.property_name || !data.property_type || !data.date) {
            return [];
        }

        // VALIDAR CAMPOS PROPORCIONALES
        const proportionalValidation = CalculateHelper.validateProportionalFields(data);
        if (!proportionalValidation.isValid) {
            throw new Error(proportionalValidation.message);
        }

        //Generar número de gasto
        const lastExpense = await RentalExpensesRepository.getLastExpenseNumber();
        let newExpenseNumber = 'FACT-G-0001';
        if (lastExpense.length > 0) {
            const lastNumber = parseInt(lastExpense[0].expense_number.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;
            newExpenseNumber = `FACT-G-${String(nextNumber).padStart(4, '0')}`;
        }

        // CALCULAR TOTAL (normal o proporcional)
        const calculationResult = CalculateHelper.calculateExpenseTotal(data);

        // GENERAR MES DE CORRESPONDENCIA
        const correspondingMonth = CalculateHelper.generateCorrespondingMonth(data.date, data.corresponding_month);


        // PREPARAR DATOS COMPLETOS
        const rentalExpenseData = {
            expense_number: newExpenseNumber,
            property_type: data.property_type.trim(),
            property_name: data.property_name.trim(),
            date: data.date.trim(),
            monthly_rent: parseFloat(data.monthly_rent) || 0,
            electricity: parseFloat(data.electricity) || 0,
            gas: parseFloat(data.gas) || 0,
            water: parseFloat(data.water) || 0,
            community_fees: parseFloat(data.community_fees) || 0,
            insurance: parseFloat(data.insurance) || 0,
            waste_tax: parseFloat(data.waste_tax) || 0,
            others: parseFloat(data.others) || 0,
            total_expenses: calculationResult.total, //TOTAL CALCULADO
            notes: (data.notes || '').toUpperCase().trim(),
            payment_status: data.payment_status || 'pending',
            payment_method: data.payment_method || 'transfer',
            payment_date: data.payment_date || null,
            payment_notes: data.payment_notes || '',
            start_date: data.start_date || null,
            end_date: data.end_date || null,
            corresponding_month: correspondingMonth,
            is_proportional: data.is_proportional || 0
        };

        //VALIDAR DUPLICADOS POR MES (REGLA DE NEGOCIO SIMPLIFICADA)
        const correspondingMonthResult = CalculateHelper.generateCorrespondingMonth(rentalExpenseData.date);

        // Extraer año y mes del resultado
        const {year, month} = CalculateHelper.extractYearMonth(rentalExpenseData.date);

        // Buscar duplicados
        const monthlyExpense = await RentalExpensesRepository.findByPropertyAndMonth(
            rentalExpenseData.property_name, year, month
        );

        // 5. Verificar duplicados
        if (monthlyExpense && monthlyExpense.length > 0) {
            for (const existingExpense of monthlyExpense) {

                // Saltar abonos en la comparación
                if (existingExpense.is_refund) continue;

                // CONVERTIR los datos de BD a números UNA VEZ
                const existing = {
                    monthly_rent: parseFloat(existingExpense.monthly_rent) || 0,
                    electricity: parseFloat(existingExpense.electricity) || 0,
                    gas: parseFloat(existingExpense.gas) || 0,
                    water: parseFloat(existingExpense.water) || 0,
                    community_fees: parseFloat(existingExpense.community_fees) || 0,
                    insurance: parseFloat(existingExpense.insurance) || 0,
                    waste_tax: parseFloat(existingExpense.waste_tax) || 0,
                    others: parseFloat(existingExpense.others) || 0
                };

                // COMPARAR: Si ambos tienen el mismo concepto con el mismo importe = duplicado
                if (existing.monthly_rent > 0 && rentalExpenseData.monthly_rent > 0 && existing.monthly_rent === rentalExpenseData.monthly_rent) return [];

                if (existing.electricity > 0 && rentalExpenseData.electricity > 0 && existing.electricity === rentalExpenseData.electricity) return [];

                if (existing.gas > 0 && rentalExpenseData.gas > 0 && existing.gas === rentalExpenseData.gas) return [];

                if (existing.water > 0 && rentalExpenseData.water > 0 && existing.water === rentalExpenseData.water) return [];

                if (existing.community_fees > 0 && rentalExpenseData.community_fees > 0 && existing.community_fees === rentalExpenseData.community_fees) return [];

                if (existing.insurance > 0 && rentalExpenseData.insurance > 0 && existing.insurance === rentalExpenseData.insurance) return [];

                if (existing.waste_tax > 0 && rentalExpenseData.waste_tax > 0 && existing.waste_tax === rentalExpenseData.waste_tax) return [];

                if (existing.others > 0 && rentalExpenseData.others > 0 && existing.others === rentalExpenseData.others) return [];
            }
        }

        // 6. Si llegamos aquí, no hay duplicados - crear el gasto
        const created = await RentalExpensesRepository.create(rentalExpenseData);

        if (created && created.length > 0) {
            return [{...rentalExpenseData, id: created[0].id}];
        }

        return [];
    }

    /**
     * Actualizar gasto de alquiler por ID
     * @param {number|string} id ID del gasto
     * @param {Object} data Nuevos datos
     * @returns {Array} Gasto actualizado o vacío si no existe o falla
     */
    static async updateRentalExpenses(id, data) {
        // 1. Validar ID
        if (!id || isNaN(Number(id)) || Number(id) <= 0) return [];

        // 2. Validar que data existe
        if (!data) return [];

        // 3. Verificar que el gasto existe
        const existing = await RentalExpensesRepository.findById(id);
        if (existing.length === 0) return [];

        // 🆕 4. VALIDAR CAMPOS PROPORCIONALES
        const proportionalValidation = CalculateHelper.validateProportionalFields({
            ...existing[0],
            ...data
        });
        if (!proportionalValidation.isValid) {
            throw new Error(proportionalValidation.message);
        }

        // 🆕 5. RECALCULAR TOTAL (normal o proporcional)
        const dataForCalculation = {
            monthly_rent: parseFloat(data.monthly_rent) || existing[0].monthly_rent || 0,
            electricity: parseFloat(data.electricity) || existing[0].electricity || 0,
            gas: parseFloat(data.gas) || existing[0].gas || 0,
            water: parseFloat(data.water) || existing[0].water || 0,
            community_fees: parseFloat(data.community_fees) || existing[0].community_fees || 0,
            insurance: parseFloat(data.insurance) || existing[0].insurance || 0,
            waste_tax: parseFloat(data.waste_tax) || existing[0].waste_tax || 0,
            others: parseFloat(data.others) || existing[0].others || 0,
            is_proportional: data.is_proportional !== undefined ? data.is_proportional : existing[0].is_proportional,
            start_date: data.start_date || existing[0].start_date,
            end_date: data.end_date || existing[0].end_date
        };

        const calculationResult = CalculateHelper.calculateExpenseTotal(dataForCalculation);

        // 🆕 6. GENERAR MES DE CORRESPONDENCIA ACTUALIZADO
        const correspondingMonth = CalculateHelper.generateCorrespondingMonth(
            data.date || existing[0].date,
            data.corresponding_month
        );

        // 7. Preparar datos completos con total recalculado
        const rentalExpenseData = {
            id: Number(id),
            property_type: (data.property_type || existing[0].property_type).trim(),
            property_name: (data.property_name || existing[0].property_name).trim(),
            date: (data.date || existing[0].date).trim(),
            monthly_rent: parseFloat(data.monthly_rent) || existing[0].monthly_rent || 0,
            electricity: parseFloat(data.electricity) || existing[0].electricity || 0,
            gas: parseFloat(data.gas) || existing[0].gas || 0,
            water: parseFloat(data.water) || existing[0].water || 0,
            community_fees: parseFloat(data.community_fees) || existing[0].community_fees || 0,
            insurance: parseFloat(data.insurance) || existing[0].insurance || 0,
            waste_tax: parseFloat(data.waste_tax) || existing[0].waste_tax || 0,
            others: parseFloat(data.others) || existing[0].others || 0,
            total_expenses: calculationResult.total, // 🆕 TOTAL RECALCULADO
            notes: (data.notes || existing[0].notes || '').toUpperCase().trim(),
            payment_status: data.payment_status || existing[0].payment_status,
            payment_method: data.payment_method || existing[0].payment_method,
            payment_date: data.payment_date || existing[0].payment_date,
            payment_notes: data.payment_notes || existing[0].payment_notes,
            // 🆕 CAMPOS PROPORCIONALES
            start_date: data.start_date !== undefined ? data.start_date : existing[0].start_date,
            end_date: data.end_date !== undefined ? data.end_date : existing[0].end_date,
            corresponding_month: correspondingMonth,
            is_proportional: data.is_proportional !== undefined ? data.is_proportional : existing[0].is_proportional
        };

        // 8. Actualizar el gasto
        const updated = await RentalExpensesRepository.update(id, rentalExpenseData);

        if (!updated || updated.length === 0) return [];

        return [rentalExpenseData];
    }

    /**
     * Eliminar gasto de alquiler por ID
     * @param {number|string} id ID del gasto
     * @returns {Array} Confirmación o vacío si no existe o falla
     */
    static
    async deleteRentalExpenses(id) {
        if (!id || isNaN(Number(id))) return []

        const existing = await RentalExpensesRepository.findById(id);
        if (!existing || existing.length === 0) return [];

        const result = await RentalExpensesRepository.delete(id);
        if (!result || result.length === 0) return [];

        return [{deleted: true, id: Number(id)}];
    };

    // ========================================
    // GESTIÓN DE ABONOS/REEMBOLSOS
    // ========================================


    /**
     * Obtener todos los abonos
     */
    static async getAllRefunds() {
        return await RentalExpensesRepository.getAllRefunds();
    }

    /**
     * Crear abono basado en gasto original
     * 🆕 ACTUALIZADO: Hereda campos proporcionales del gasto original
     */
    static async createRefund(originalExpenseId, refundReason = '') {
        // Validar ID
        if (!originalExpenseId || isNaN(Number(originalExpenseId))) return [];

        // Obtener gasto original
        const original = await RentalExpensesRepository.findById(originalExpenseId);
        if (!original.length) return [];

        // No se puede hacer abono de un abono
        if (original[0].is_refund) return [];

        // Generar número de abono
        const lastRefund = await RentalExpensesRepository.getLastRefundNumber();
        let newRefundNumber = 'ABONO-G-0001';
        if (lastRefund.length > 0) {
            const lastNumber = parseInt(lastRefund[0].expense_number.replace(/\D/g, ''), 10);
            const nextNumber = lastNumber + 1;
            newRefundNumber = `ABONO-G-${String(nextNumber).padStart(4, '0')}`;
        }

        // 🆕 CALCULAR TOTAL NEGATIVO (respetando si es proporcional o no)
        const originalExpenseForCalculation = {
            monthly_rent: original[0].monthly_rent,
            electricity: original[0].electricity,
            gas: original[0].gas,
            water: original[0].water,
            community_fees: original[0].community_fees,
            insurance: original[0].insurance,
            waste_tax: original[0].waste_tax,
            others: original[0].others,
            is_proportional: original[0].is_proportional,
            start_date: original[0].start_date,
            end_date: original[0].end_date
        };

        const calculationResult = CalculateHelper.calculateExpenseTotal(originalExpenseForCalculation);
        const negativeTotal = -Math.abs(calculationResult.total);

        // Crear abono con valores negativos Y heredando campos proporcionales
        const refundData = {
            expense_number: newRefundNumber,
            property_type: original[0].property_type,
            property_name: original[0].property_name,
            date: new Date().toISOString().split('T')[0],
            monthly_rent: -Math.abs(original[0].monthly_rent),
            electricity: -Math.abs(original[0].electricity),
            gas: -Math.abs(original[0].gas),
            water: -Math.abs(original[0].water),
            community_fees: -Math.abs(original[0].community_fees),
            insurance: -Math.abs(original[0].insurance),
            waste_tax: -Math.abs(original[0].waste_tax),
            others: -Math.abs(original[0].others),
            total_expenses: negativeTotal, // 🆕 TOTAL CALCULADO NEGATIVO
            notes: `ABONO-G- - ${refundReason || 'Rectificación'} - Original: ${original[0].expense_number || original[0].id}`,
            original_expense_id: original[0].id,
            payment_status: 'pending',
            payment_method: 'transfer',
            payment_date: null,
            payment_notes: `Abono de gasto ${original[0].expense_number}`,
            // 🆕 HEREDAR CAMPOS PROPORCIONALES DEL GASTO ORIGINAL
            start_date: original[0].start_date,
            end_date: original[0].end_date,
            corresponding_month: original[0].corresponding_month,
            is_proportional: original[0].is_proportional
        };

        const created = await RentalExpensesRepository.createRefund(refundData);

        if (created && created.length > 0) {
            return [{...refundData, id: created[0].id}];
        }

        return [];
    }

    // ==============
    // MÉTODOS PDF
    // ==============

    /**
     * Obtener gasto con detalles completos y cálculos
     * @param {number|string} id - ID del gasto
     * @returns {Object|null} Gasto con detalles o null si no existe
     */
    static async getExpenseWithDetails(id) {
        // Validar ID
        if (!id || isNaN(Number(id))) return null;

        // Obtener gasto
        const expense = await RentalExpensesRepository.findById(id);
        if (!expense.length) return null;

        const expenseData = expense[0];

        // Calcular total
        const total = CalculateHelper.calculateExpenseSimpleTotal(expenseData);

        // Agregar información adicional
        return {
            ...expenseData,
            total_calculated: total,
            formatted_date: new Date(expenseData.date).toLocaleDateString('es-ES'),
            is_negative: total < 0,
            expense_type: expenseData.is_refund ? 'Abono' : 'Gasto',
            has_original: !!expenseData.original_expense_id
        };
    }

    /**
     * Obtener abono con detalles completos incluyendo gasto original
     * @param {number|string} id - ID del abono
     * @returns {Object|null} Abono con detalles o null si no existe
     */
    static async getRefundWithDetails(id) {
        // Validar ID
        if (!id || isNaN(Number(id))) return null;

        // Obtener abono
        const refund = await RentalExpensesRepository.findById(id);
        if (!refund.length) return null;

        const refundData = refund[0];

        // Verificar que sea un abono
        if (!refundData.is_refund) return null;

        // Obtener gasto original si existe
        let originalExpense = null;
        if (refundData.original_expense_id) {
            const original = await RentalExpensesRepository.findById(refundData.original_expense_id);
            if (original && original.length > 0) {
                originalExpense = original[0];
            }
        }

        // Calcular total del abono
        const total = CalculateHelper.calculateExpenseSimpleTotal(refundData);

        return {
            ...refundData,
            total_calculated: total,
            formatted_date: new Date(refundData.date).toLocaleDateString('es-ES'),
            original_expense: originalExpense,
            original_expense_number: originalExpense?.expense_number || null,
            original_total: originalExpense ? CalculateHelper.calculateExpenseSimpleTotal(originalExpense) : null
        };
    }

    /**
     * Obtener gasto para PDF (solo si es válido)
     * @param {number|string} id - ID del gasto
     * @returns {Object|null} Gasto si es válido, null si no
     */
    static async getExpenseForPdf(id) {
        if (!id || isNaN(Number(id))) return null;

        const expense = await RentalExpensesRepository.findById(id);
        if (!expense.length) return null;

        // Verificar que NO sea un abono
        if (expense[0].is_refund) return null;

        return expense[0];
    }

    /**
     * Obtener abono para PDF (solo si es válido)
     * @param {number|string} id - ID del abono
     * @returns {Object|null} Abono si es válido, null si no
     */
    static async getRefundForPdf(id) {
        if (!id || isNaN(Number(id))) return null;

        const refund = await RentalExpensesRepository.findById(id);
        if (!refund.length) return null;

        // Verificar que SÍ sea un abono
        if (!refund[0].is_refund) return null;

        return refund[0];
    }

    /**
     * Generar nombre de archivo seguro para PDF
     * @param {Object} expenseData - Datos del gasto/abono
     * @param {string} prefix - Prefijo ('gasto' o 'abono')
     * @returns {string} Nombre de archivo seguro
     */
    static generatePdfFileName(expenseData, prefix = 'documento') {
        const expenseNumber = expenseData.expense_number || `${prefix}_${expenseData.id}`;
        return `${expenseNumber.replace(/[\/\\:*?"<>|]/g, '-')}.pdf`;
    }

    /**
     * Obtener resumen de gastos vs abonos por propiedad
     * @param {string} propertyName - Nombre de la propiedad
     * @returns {Object} Resumen con totales
     */
    static async getExpenseSummaryByProperty(propertyName) {
        if (!propertyName || propertyName.length === 0) return null;

        const allExpenses = await RentalExpensesRepository.findByPropertyName(propertyName);
        if (!allExpenses.length) return null;

        const expenses = allExpenses.filter(e => !e.is_refund);
        const refunds = allExpenses.filter(e => e.is_refund);

        const totalExpenses = expenses.reduce((sum, expense) => sum + CalculateHelper.calculateExpenseSimpleTotal(expense), 0);
        const totalRefunds = refunds.reduce((sum, refund) => sum + CalculateHelper.calculateExpenseSimpleTotal(refund), 0);
        const netTotal = totalExpenses + totalRefunds; // Los refunds ya son negativos

        return {
            property_name: propertyName,
            total_expenses: totalExpenses,
            total_refunds: Math.abs(totalRefunds),
            net_total: netTotal,
            expenses_count: expenses.length,
            refunds_count: refunds.length,
            formatted_total_expenses: this.formatCurrency(totalExpenses),
            formatted_total_refunds: this.formatCurrency(Math.abs(totalRefunds)),
            formatted_net_total: this.formatCurrency(netTotal)
        };
    }

    /**
     * Obtener balance neto por período
     * @param {Object} params - Parámetros del período
     * @returns {Object} Balance del período
     */
    static async getNetBalanceByPeriod({startDate, endDate, propertyName = null}) {
        // Validar fechas
        if (!startDate || !endDate) return null;

        // Aquí necesitarías un método en el Repository para filtrar por fechas
        // Por ahora, simulamos la lógica
        const allExpenses = propertyName
            ? await RentalExpensesRepository.findByPropertyName(propertyName)
            : await RentalExpensesRepository.getAll();

        // Filtrar por período
        const filteredExpenses = allExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return expenseDate >= start && expenseDate <= end;
        });

        const expenses = filteredExpenses.filter(e => !e.is_refund);
        const refunds = filteredExpenses.filter(e => e.is_refund);

        const totalExpenses = expenses.reduce((sum, expense) => sum + CalculateHelper.calculateExpenseSimpleTotal(expense), 0);
        const totalRefunds = refunds.reduce((sum, refund) => sum + CalculateHelper.calculateExpenseSimpleTotal(refund), 0);

        return {
            period: {startDate, endDate},
            property_name: propertyName,
            total_expenses: totalExpenses,
            total_refunds: Math.abs(totalRefunds),
            net_balance: totalExpenses + totalRefunds,
            expenses_count: expenses.length,
            refunds_count: refunds.length,
            expenses_list: expenses,
            refunds_list: refunds
        };
    }

    /**
     * Formatear número como moneda
     * @param {number} amount - Cantidad a formatear
     * @returns {string} Cantidad formateada
     */
    static formatCurrency(amount) {
        const num = parseFloat(amount) || 0;
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(num);
    }

    /**
     * Buscar gasto por número de expense
     * @param {string} expenseNumber - Número del gasto
     * @returns {Array} Gasto encontrado
     */
    static async getByExpenseNumber(expenseNumber) {
        if (!expenseNumber || expenseNumber.length === 0) return [];
        return await RentalExpensesRepository.findByExpenseNumber(expenseNumber);
    }

    /**
     * GESTIÓN DE PAGOS
     */

    /**
     * Actualizar el estado de pago de un gasto con validaciones
     * @param {number} id - ID del gasto
     * @param {Object} paymentData - Datos del pago
     * @returns {Object|null} Gasto actualizado o null si hay error
     */
    static async updatePaymentStatus(id, paymentData) {
        // Validar ID
        if (!id || isNaN(Number(id))) return [];

        // Validar que el gasto existe
        const existing = await RentalExpensesRepository.findById(id);
        if (!existing.length > 0) return [];

        // Validar estados permitidos
        const validStatuses = ['pending', 'paid'];
        if (!validStatuses.includes(paymentData.payment_status)) {
            return null;
        }

        // Validar métodos permitidos
        const validMethods = ['direct_debit', 'cash', 'card', 'transfer'];
        if (!validMethods.includes(paymentData.payment_method)) {
            return null;
        }

        // REGLA DE NEGOCIO: Si se marca como pagado, debe tener fecha
        if (paymentData.payment_status === 'paid' && !paymentData.payment_date) {
            paymentData.payment_date = new Date().toISOString().split('T')[0]; // Hoy
        }

        // REGLA DE NEGOCIO: Si se marca como pendiente, limpiar fecha de pago
        if (paymentData.payment_status === 'pending') {
            paymentData.payment_date = null;
        }

        // Actualizar en base de datos
        const updated = await RentalExpensesRepository.updatePaymentStatus(Number(id), paymentData);
        if (!updated.length) return [];

        // Devolver el gasto actualizado
        const updatedExpense = await RentalExpensesRepository.findById(id);
        return updatedExpense;
    }

    /**
     * 🆕 MÉTODOS PARA FUNCIONALIDAD PROPORCIONAL
     */

    /**
     * Obtiene detalles de cálculo de un gasto proporcional
     * @param {number} expenseId - ID del gasto
     * @returns {Object} Detalles del cálculo proporcional
     */
    static async getProportionalCalculationDetails(expenseId) {
        const expense = await RentalExpensesRepository.findById(expenseId);
        if (!expense.length) return null;

        const expenseData = expense[0];
        return CalculateHelper.getCalculationDetails(expenseData);
    }


}