import InternalExpensesRepository from "../repository/InternalExpensesRepository.js";
import {sanitizeString} from "../shared/helpers/stringHelpers.js";
import CalculateHelper from "../shared/helpers/calculateTotal.js";

/**
 * Servicio de gastos internos de la empresa
 * Maneja toda la lógica de negocio relacionada con gastos internos
 * Incluye validaciones, cálculos automáticos y gestión de estados
 * DISEÑADO DESDE CERO para el sistema de gastos internos
 *
 */
export default class InternalExpensesService {

    // ==========================================
    // OBTENER GASTOS INTERNOS (CONSULTAS)
    // ==========================================

    /**
     * Obtiene todos los gastos internos con formato estandarizado
     */
    static async getAllExpenses() {
        const expenses = await InternalExpensesRepository.getAll();

        return expenses.map(expense => ({
            id: expense.id,
            expense_date: expense.expense_date,
            category: expense.category,
            subcategory: expense.subcategory,
            description: expense.description,
            amount: parseFloat(expense.amount),
            iva_percentage: parseFloat(expense.iva_percentage),
            iva_amount: parseFloat(expense.iva_amount),
            total_amount: parseFloat(expense.total_amount),
            is_deductible: Boolean(expense.is_deductible),
            supplier_name: expense.supplier_name,
            supplier_nif: expense.supplier_nif,
            supplier_address: expense.supplier_address,
            payment_method: expense.payment_method,
            receipt_number: expense.receipt_number,
            receipt_date: expense.receipt_date,
            pdf_path: expense.pdf_path,
            has_attachments: Boolean(expense.has_attachments),
            property_id: expense.property_id,
            project_code: expense.project_code,
            cost_center: expense.cost_center,
            notes: expense.notes,
            is_recurring: Boolean(expense.is_recurring),
            recurrence_period: expense.recurrence_period,
            next_occurrence_date: expense.next_occurrence_date,
            status: expense.status,
            created_by: expense.created_by,
            approved_by: expense.approved_by,
            approval_date: expense.approval_date,
            created_at: expense.created_at,
            updated_at: expense.updated_at,
            // Nuevas propiedades añadidas para el reparto por propietario
            owners_id: expense.owners_id || null, // Puede ser null si no hay propiedad asociada o propietarios en estates_owners
            ownership_percent: expense.ownership_percentage || 0 // Porcentaje de propiedad
        }));
    }

    // ==========================================
    // BÚSQUEDAS ESPECÍFICAS CON VALIDACIÓN
    // ==========================================

    /**
     * Busca un gasto por su ID
     */
    static async getExpenseById(id) {
        if (!id || isNaN(Number(id))) return [];
        return await InternalExpensesRepository.findById(id);
    }

    /**
     * Obtiene gastos por categoría
     */
    static async getExpensesByCategory(category) {
        if (!category || typeof category !== 'string') return [];
        const validCategories = CalculateHelper.getValidInvoiceExpenseCategory();
        if (!validCategories.includes(category)) return [];
        return await InternalExpensesRepository.findByCategory(category);
    }

    /**
     * Obtiene gastos por subcategoría
     */
    static async getExpensesBySubcategory(subcategory) {
        if (!subcategory || typeof subcategory !== 'string') return [];
        return await InternalExpensesRepository.findBySubcategory(sanitizeString(subcategory));
    }

    /**
     * Obtiene gastos por proveedor
     */
    static async getExpensesBySupplier(supplierName) {
        if (!supplierName || typeof supplierName !== 'string') return [];
        return await InternalExpensesRepository.findBySupplier(sanitizeString(supplierName));
    }

    /**
     * Obtiene gastos por estado
     */
    static async getExpensesByStatus(status) {
        const validStatuses = CalculateHelper.getExpensesStatus();
        if (!validStatuses.includes(status)) return [];
        return await InternalExpensesRepository.findByStatus(status);
    }

    /**
     * Obtiene gastos por método de pago
     */
    static async getExpensesByPaymentMethod(paymentMethod) {
        const validMethods = CalculateHelper.getValidPaymentMethodExpenses();
        if (!validMethods.includes(paymentMethod)) return [];
        return await InternalExpensesRepository.findByPaymentMethod(paymentMethod);
    }

    /**
     * Obtiene gastos deducibles
     */
    static async getDeductibleExpenses() {
        return await InternalExpensesRepository.findDeductible();
    }

    /**
     * Obtiene gastos no deducibles
     */
    static async getNonDeductibleExpenses() {
        return await InternalExpensesRepository.findNonDeductible();
    }

    /**
     * Busca gastos por rango de fechas
     */
    static async getExpensesByDateRange(startDate, endDate) {
        const validation = CalculateHelper.validateDateRange(startDate, endDate, {
            maxRangeYears: 2,
            allowFutureDates: false
        });

        if (!validation.isValid) {
            return [];
        }
        return await InternalExpensesRepository.findByDateRange(startDate, endDate);
    }

    /**
     * Busca gastos por rango de importes
     */
    static async getExpensesByAmountRange(minAmount, maxAmount) {
        if (!minAmount || !maxAmount || isNaN(Number(minAmount)) || isNaN(Number(maxAmount))) {
            return [];
        }
        if (Number(minAmount) < 0 || Number(maxAmount) < 0 || Number(minAmount) > Number(maxAmount)) {
            return [];
        }
        return await InternalExpensesRepository.findByAmountRange(Number(minAmount), Number(maxAmount));
    }

    /**
     * Obtiene gastos relacionados con una propiedad
     */
    static async getExpensesByProperty(propertyId) {
        if (!propertyId || isNaN(Number(propertyId))) return [];
        return await InternalExpensesRepository.findByProperty(propertyId);
    }

    /**
     * Obtiene gastos por proyecto
     */
    static async getExpensesByProject(projectCode) {
        if (!projectCode || typeof projectCode !== 'string') return [];
        return await InternalExpensesRepository.findByProject(sanitizeString(projectCode));
    }

    /**
     * Obtiene gastos por centro de coste
     */
    static async getExpensesByCostCenter(costCenter) {
        if (!costCenter || typeof costCenter !== 'string') return [];
        return await InternalExpensesRepository.findByCostCenter(sanitizeString(costCenter));
    }

    /**
     * Obtiene gastos recurrentes
     */
    static async getRecurringExpenses() {
        return await InternalExpensesRepository.findRecurring();
    }

    /**
     * Obtiene gastos pendientes de aprobación
     */
    static async getPendingApprovalExpenses() {
        return await InternalExpensesRepository.findPendingApproval();
    }

    /**
     * Búsqueda avanzada con múltiples filtros
     */
    static async getExpensesAdvanced(filters) {
        // Validar y sanitizar filtros
        const cleanFilters = {};

        if (filters.category) {
            const validCategories = CalculateHelper.getValidExpensesCategoryAdvanced();
            if (validCategories.includes(filters.category)) {
                cleanFilters.category = filters.category;
            }
        }

        if (filters.subcategory) {
            cleanFilters.subcategory = sanitizeString(filters.subcategory);
        }

        if (filters.status) {
            const validStatuses = CalculateHelper.getExpensesStatus();
            if (validStatuses.includes(filters.status)) {
                cleanFilters.status = filters.status;
            }
        }

        if (filters.supplier_name) {
            cleanFilters.supplier_name = sanitizeString(filters.supplier_name);
        }

        if (filters.payment_method) {
            const validMethods = CalculateHelper.getValidPaymentMethodExpenses();
            if (validMethods.includes(filters.payment_method)) {
                cleanFilters.payment_method = filters.payment_method;
            }
        }

        if (filters.is_deductible !== undefined) {
            cleanFilters.is_deductible = Boolean(filters.is_deductible);
        }

        //Usar CalculateHelper para validación de fechas
        if (filters.start_date && filters.end_date) {
            const validation = CalculateHelper.validateDateRange(filters.start_date, filters.end_date, {
                maxRangeYears: 2
            });
            if (validation.isValid) {
                cleanFilters.start_date = filters.start_date;
                cleanFilters.end_date = filters.end_date;
            }
        }

        if (filters.min_amount && filters.max_amount) {
            const minAmount = Number(filters.min_amount);
            const maxAmount = Number(filters.max_amount);
            if (!isNaN(minAmount) && !isNaN(maxAmount) && minAmount >= 0 && maxAmount >= 0 && minAmount <= maxAmount) {
                cleanFilters.min_amount = minAmount;
                cleanFilters.max_amount = maxAmount;
            }
        }

        if (filters.property_id && !isNaN(Number(filters.property_id))) {
            cleanFilters.property_id = Number(filters.property_id);
        }

        if (filters.project_code) {
            cleanFilters.project_code = sanitizeString(filters.project_code);
        }

        return await InternalExpensesRepository.findAdvanced(cleanFilters);
    }

    // ==========================================
    // CREAR NUEVO GASTO INTERNO
    // ==========================================

    /**
     *Usa CalculateHelper para IVA y validaciones
     * Crea un nuevo gasto interno con validaciones completas
     */
    static async createExpense(data) {
        const {expense_date, category, description, amount, supplier_name} = data;

        // Validación de datos obligatorios
        if (!expense_date || !category || !description || !amount || !supplier_name) return [];

        // Validar categoría
        const validCategories = CalculateHelper.getValidInvoiceExpenseCategory();
        if (!validCategories.includes(category)) return [];

        // Validar importe
        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) return [];

        // Validar fecha
        const dateValidation = CalculateHelper.validateDateRange(expense_date, expense_date, {
            maxRangeYears: 1,
            allowFutureDates: false
        });
        if (!dateValidation.isValid) return [];

        //Usar CalculateHelper para cálculo de IVA
        const ivaPercentage = data.iva_percentage !== undefined ? Number(data.iva_percentage) : 21.00;
        const ivaAmount = CalculateHelper.calculateIVA(amountNum, ivaPercentage);
        const totalAmount = amountNum + ivaAmount;

        // Preparar datos para inserción
        const expenseData = {
            ...data,
            amount: amountNum,
            iva_percentage: ivaPercentage,
            iva_amount: ivaAmount,
            total_amount: totalAmount,
            supplier_name: sanitizeString(supplier_name),
            subcategory: data.subcategory ? sanitizeString(data.subcategory) : null,
            description: sanitizeString(description),
            notes: data.notes ? sanitizeString(data.notes) : null,
            is_deductible: data.is_deductible !== undefined ? Boolean(data.is_deductible) : true,
            payment_method: data.payment_method || 'card',
            status: data.status || 'pending',
            is_recurring: data.is_recurring !== undefined ? Boolean(data.is_recurring) : false
        };

        //Usar CalculateHelper para validar recurrencia
        const recurringValidation = CalculateHelper.validateRecurringFields(expenseData);
        if (!recurringValidation.isValid) return [];

        if (expenseData.is_recurring) {
            expenseData.recurrence_period = data.recurrence_period;
            //Usar CalculateHelper para calcular próxima ocurrencia
            expenseData.next_occurrence_date = CalculateHelper.calculateNextOccurrence(expense_date, data.recurrence_period);
        }

        const created = await InternalExpensesRepository.create(expenseData);
        if (!created.length > 0) return [];

        return [{...expenseData, id: created[0].id}];
    }

    // ==========================================
    // ACTUALIZAR GASTO EXISTENTE
    // ==========================================

    /**
     * Usa CalculateHelper para IVA
     * Actualiza un gasto existente
     */
    static async updateExpense(id, updateData) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await InternalExpensesRepository.findById(id);
        if (!existing || existing.length === 0) return [];

        // Validar datos si se proporcionan
        if (updateData.category) {
            const validCategories = CalculateHelper.getValidInvoiceExpenseCategory();
            if (!validCategories.includes(updateData.category)) return [];
        }

        if (updateData.amount !== undefined) {
            const amountNum = Number(updateData.amount);
            if (isNaN(amountNum) || amountNum <= 0) return [];
        }

        if (updateData.status) {
            const validStatuses = CalculateHelper.getExpensesStatus();
            if (!validStatuses.includes(updateData.status)) return [];
        }

        //Usar CalculateHelper para recalcular IVA
        const dataForCalculation = {
            amount: updateData.amount !== undefined ? Number(updateData.amount) : existing[0].amount,
            iva_percentage: updateData.iva_percentage !== undefined ? Number(updateData.iva_percentage) : existing[0].iva_percentage
        };

        const ivaAmount = CalculateHelper.calculateIVA(dataForCalculation.amount, dataForCalculation.iva_percentage);
        const totalAmount = dataForCalculation.amount + ivaAmount;

        // Preparar datos actualizados
        const cleanExpenseData = {
            id,
            expense_date: updateData.expense_date || existing[0].expense_date,
            category: updateData.category || existing[0].category,
            subcategory: updateData.subcategory !== undefined ?
                (updateData.subcategory ? sanitizeString(updateData.subcategory) : null) : existing[0].subcategory,
            description: updateData.description ? sanitizeString(updateData.description) : existing[0].description,
            amount: dataForCalculation.amount,
            iva_percentage: dataForCalculation.iva_percentage,
            iva_amount: ivaAmount,
            total_amount: totalAmount,
            is_deductible: updateData.is_deductible !== undefined ? Boolean(updateData.is_deductible) : existing[0].is_deductible,
            supplier_name: updateData.supplier_name ? sanitizeString(updateData.supplier_name) : existing[0].supplier_name,
            supplier_nif: updateData.supplier_nif !== undefined ? updateData.supplier_nif : existing[0].supplier_nif,
            supplier_address: updateData.supplier_address !== undefined ? updateData.supplier_address : existing[0].supplier_address,
            payment_method: updateData.payment_method || existing[0].payment_method,
            receipt_number: updateData.receipt_number !== undefined ? updateData.receipt_number : existing[0].receipt_number,
            receipt_date: updateData.receipt_date !== undefined ? updateData.receipt_date : existing[0].receipt_date,
            pdf_path: updateData.pdf_path !== undefined ? updateData.pdf_path : existing[0].pdf_path,
            has_attachments: updateData.has_attachments !== undefined ? Boolean(updateData.has_attachments) : existing[0].has_attachments,
            property_id: updateData.property_id !== undefined ? updateData.property_id : existing[0].property_id,
            project_code: updateData.project_code !== undefined ? updateData.project_code : existing[0].project_code,
            cost_center: updateData.cost_center !== undefined ? updateData.cost_center : existing[0].cost_center,
            notes: updateData.notes !== undefined ?
                (updateData.notes ? sanitizeString(updateData.notes) : null) : existing[0].notes,
            is_recurring: updateData.is_recurring !== undefined ? Boolean(updateData.is_recurring) : existing[0].is_recurring,
            recurrence_period: updateData.recurrence_period !== undefined ? updateData.recurrence_period : existing[0].recurrence_period,
            next_occurrence_date: updateData.next_occurrence_date !== undefined ? updateData.next_occurrence_date : existing[0].next_occurrence_date,
            status: updateData.status || existing[0].status
        };

        try {
            const updated = await InternalExpensesRepository.update(cleanExpenseData);
            return updated;
        } catch (error) {
            return [];
        }
    }

    /**
     * Elimina un gasto
     */
    static async deleteExpense(id) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await InternalExpensesRepository.findById(id);
        if (!existing.length > 0) return [];

        // REGLA DE NEGOCIO: No se pueden eliminar gastos aprobados o pagados
        if (existing[0].status === 'approved' || existing[0].status === 'paid') return [];

        const result = await InternalExpensesRepository.delete(id);
        return result.length > 0 ? [{deleted: true, id: Number(id)}] : [];
    }

    // ========================================
    // GESTIÓN DE ESTADOS
    // ========================================

    /**
     * Aprueba un gasto
     */
    static async approveExpense(id, approvedBy = null) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await InternalExpensesRepository.findById(id);
        if (!existing.length > 0) return [];

        // REGLA DE NEGOCIO: Solo se pueden aprobar gastos pendientes
        if (existing[0].status !== 'pending') return [];

        const result = await InternalExpensesRepository.approve(id, approvedBy);
        return result;
    }

    /**
     * Rechaza un gasto
     */
    static async rejectExpense(id, approvedBy = null) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await InternalExpensesRepository.findById(id);
        if (!existing.length > 0) return [];

        // REGLA DE NEGOCIO: Solo se pueden rechazar gastos pendientes
        if (existing[0].status !== 'pending') return [];

        const result = await InternalExpensesRepository.reject(id, approvedBy);
        return result;
    }

    /**
     * Marca un gasto como pagado
     */
    static async markExpenseAsPaid(id) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await InternalExpensesRepository.findById(id);
        if (!existing.length > 0) return [];

        // REGLA DE NEGOCIO: Solo se pueden marcar como pagados gastos aprobados
        if (existing[0].status !== 'approved') return [];

        const result = await InternalExpensesRepository.markAsPaid(id);
        return result;
    }

    /**
     * Actualiza el estado de un gasto
     */
    static async updateExpenseStatus(id, status, approvedBy = null) {
        if (!id || isNaN(Number(id))) return [];

        const validStatuses = CalculateHelper.getExpensesStatus();
        if (!validStatuses.includes(status)) return [];

        const existing = await InternalExpensesRepository.findById(id);
        if (!existing.length > 0) return [];

        // Validaciones según el estado
        switch (status) {
            case 'approved':
                if (existing[0].status !== 'pending') return [];
                break;
            case 'rejected':
                if (existing[0].status !== 'pending') return [];
                break;
            case 'paid':
                if (existing[0].status !== 'approved') return [];
                break;
        }

        const result = await InternalExpensesRepository.updateStatus(id, status, approvedBy);
        return result;
    }

    // ==========================================
    // ESTADÍSTICAS Y REPORTES
    // ==========================================

    /**
     * Obtiene estadísticas generales
     */
    static async getExpenseStats() {
        const stats = await InternalExpensesRepository.getStats();
        return {
            total_expenses: stats.total_expenses || 0,
            pending_expenses: stats.pending_expenses || 0,
            approved_expenses: stats.approved_expenses || 0,
            rejected_expenses: stats.rejected_expenses || 0,
            paid_expenses: stats.paid_expenses || 0,
            total_amount: parseFloat(stats.total_amount) || 0,
            total_iva_amount: parseFloat(stats.total_iva_amount) || 0,
            deductible_amount: parseFloat(stats.deductible_amount) || 0,
            pending_amount: parseFloat(stats.pending_amount) || 0,
            average_expense: parseFloat(stats.average_expense) || 0,
            approval_rate: stats.total_expenses > 0 ?
                Math.round(((stats.approved_expenses + stats.paid_expenses) / stats.total_expenses) * 100) : 0
        };
    }

    /**
     * Obtiene estadísticas por categoría
     */
    static async getStatsByCategory() {
        return await InternalExpensesRepository.getStatsByCategory();
    }

    /**
     * Obtiene estadísticas por proveedor
     */
    static async getStatsBySupplier() {
        return await InternalExpensesRepository.getStatsBySupplier();
    }

    /**
     * Obtiene resumen mensual
     */
    static async getMonthlySummary(year) {
        if (!year || isNaN(Number(year))) return [];
        return await InternalExpensesRepository.getMonthlySummary(Number(year));
    }

    /**
     * Obtiene resumen anual
     */
    static async getYearlySummary() {
        return await InternalExpensesRepository.getYearlySummary();
    }

    /**
     * Obtiene top gastos por importe
     */
    static async getTopExpensesByAmount(limit = 10) {
        const limitNum = Number(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return [];
        }
        return await InternalExpensesRepository.getTopExpensesByAmount(limitNum);
    }

    /**
     * Obtiene datos para el libro de IVA soportado
     */
    static async getVATBookData(year, month = null) {
        if (!year || isNaN(Number(year))) return [];

        const validMonth = month && !isNaN(Number(month)) && Number(month) >= 1 && Number(month) <= 12
            ? Number(month) : null;

        return await InternalExpensesRepository.getForVATBook(Number(year), validMonth);
    }

    /**
     * Obtiene balance de gastos
     */
    static async getExpenseStatement(year, month = null) {
        if (!year || isNaN(Number(year))) return [];

        const validMonth = month && !isNaN(Number(month)) && Number(month) >= 1 && Number(month) <= 12
            ? Number(month) : null;

        return await InternalExpensesRepository.getExpenseStatement(Number(year), validMonth);
    }

    // ==========================================
    // GESTIÓN DE GASTOS RECURRENTES
    // ==========================================

    /**
     * Obtiene gastos recurrentes que necesitan ser creados
     */
    static async getRecurringExpensesDue() {
        return await InternalExpensesRepository.getRecurringExpensesDue();
    }

    /**
     * Usa CalculateHelper.calculateNextOccurrence
     * Procesa gastos recurrentes creando nuevas instancias
     */
    static async processRecurringExpenses() {
        const recurringExpenses = await this.getRecurringExpensesDue();
        const processedExpenses = [];

        for (const expense of recurringExpenses) {
            try {
                // Crear nueva instancia del gasto
                const newExpenseData = {
                    expense_date: new Date().toISOString().split('T')[0], // Hoy
                    category: expense.category,
                    subcategory: expense.subcategory,
                    description: `${expense.description} (Gasto recurrente)`,
                    amount: expense.amount,
                    iva_percentage: expense.iva_percentage,
                    is_deductible: expense.is_deductible,
                    supplier_name: expense.supplier_name,
                    supplier_nif: expense.supplier_nif,
                    supplier_address: expense.supplier_address,
                    payment_method: expense.payment_method,
                    property_id: expense.property_id,
                    project_code: expense.project_code,
                    cost_center: expense.cost_center,
                    notes: expense.notes,
                    is_recurring: false, // La nueva instancia no es recurrente
                    status: 'pending'
                };

                const created = await this.createExpense(newExpenseData);
                if (created.length > 0) {
                    processedExpenses.push(created[0]);

                    // Usar CalculateHelper para calcular próxima ocurrencia
                    const nextOccurrence = CalculateHelper.calculateNextOccurrence(
                        expense.next_occurrence_date,
                        expense.recurrence_period
                    );
                    await InternalExpensesRepository.updateRecurringDates(expense.id, nextOccurrence);
                }
            } catch (error) {
                console.error(`Error procesando gasto recurrente ${expense.id}:`, error);
            }
        }

        return processedExpenses;
    }


}

