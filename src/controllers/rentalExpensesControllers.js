import path from 'path';
import fs from 'fs';
import RentalExpensesServices from "../services/rentalExpensesServices.js";
import {generateExpensePdf} from "../utils/Pdf-Expenses/rentalExpensePdfGenerator.js";
import {generateExpensesRefundPdf} from "../utils/Pdf-Expenses/rentalRefundPdfGenerator.js";


export default class RentalExpensesControllers {

    /**
     * Obtener todos los registros de gastos
     * @returns {Array} Array con todos los gastos
     */
    static async getAllExpenses(req, res) {
        try {
            const expenses = await RentalExpensesServices.getAllExpenses();
            if (!expenses.length) {
                return res.status(400).json('No existe ningún gasto registrado.')
            }
            return res.status(200).json(expenses)

        } catch (error) {
            console.log(error)
            return res.status(500).json("Error interno del servidor.");
        }
    }

    // ========================================
    // MÉTODOS DE BÚSQUEDA
    // ========================================

    /**
     * Obtener gastos filtrados por tipo de propiedad
     * @param {string} propertyType Tipo de propiedad
     * @returns {Array} Array con los gastos encontrados
     */
    static async getByPropertyType(req, res) {
        try {
            const {propertyType} = req.body;

            if (!propertyType) {
                return res.status(400).json('Falta el tipo de propiedad.');
            }
            const expensesPropertyType = await RentalExpensesServices.getByPropertyType(propertyType);
            if (!expensesPropertyType.length) {
                return res.status(404).json('No existe ningún gasto de la propiedad. ');
            }
            return res.status(200).json(expensesPropertyType);

        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }

    }

    /**
     * Obtener gastos filtrados por nombre de propiedad
     * @param {string} propertyName Nombre de la propiedad
     * @returns {Array} Array con los gastos encontrados
     */
    static async getByPropertyName(req, res) {
        try {
            const {propertyName} = req.body;
            if (!propertyName) {
                return res.status(400).json('Falta el nombre de la propiedad.');
            }
            const expensesPropertyName = await RentalExpensesServices.getByPropertyName(propertyName);
            if (!expensesPropertyName.length) {
                return res.status(404).json('No existe ningún gasto con el nombre de la propiedad. ');
            }
            return res.status(200).json(expensesPropertyName);
        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }
    }

    /**
     * Obtener un gasto por su ID
     * @param {number|string} id ID del gasto
     * @returns {Object|Array} Gasto encontrado o array vacío si no existe
     */
    static async getRentalExpenseById(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json('La ID es invalido')
            }
            const expensesId = await RentalExpensesServices.getRentalExpenseById(id);
            if (!expensesId.length) {
                return res.status(404).json('No existe ningun dato registrado.');
            }
            return res.status(200).json(expensesId);

        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }
    }

    // ========================================
    // MÉTODOS CRUD
    // ========================================

    /**
     * Crear nuevo gasto de alquiler
     * @param {Object} data Datos del gasto
     * @returns {Array} Gasto creado o vacío si es duplicado o falla
     */
    static async createRentalExpenses(req, res) {
        try {
            //Verificar campos obligatorios
            if (!req.body.property_name || !req.body.property_type || !req.body.date) {
                return res.status(400).json('Faltan campos obligatorios');
            }

            //Intentar crear el gasto
            const created = await RentalExpensesServices.createRentalExpenses(req.body);

            //Si no se creó, es porque ya existe
            if (created.length === 0) {
                return res.status(400).json('Este gasto ya existe');
            }
            //Si se creó, devolver éxito
            return res.status(201).json(created);

        } catch (error) {
            console.log('Error:', error);
            if (error.message && error.message.includes('proporcional')) {
                return res.status(400).json(error.message);
            }
            return res.status(500).json("Error interno del servidor.");

        }
    }

    /**
     * Actualizar gasto de alquiler por ID
     * @param {number|string} id ID del gasto
     * @param {Object} data Nuevos datos
     * @returns {Array} Gasto actualizado o vacío si no existe o falla
     */
    static async updateRentalExpenses(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json('La ID es invalido.')
            }

            // Validar campos obligatorios
            if (!req.body.property_name || !req.body.property_type || !req.body.date) {
                return res.status(400).json('Faltan campos obligatorios');
            }

            const updatedExpenses = await RentalExpensesServices.updateRentalExpenses(id, req.body);

            if (!updatedExpenses.length) {
                console.log(updatedExpenses)
                return res.status(404).json('Error: gasto no encontrado o ya existe uno igual')
            }
            return res.status(200).json(updatedExpenses);

        } catch (error) {
            if (error.message && error.message.includes('proporcional')) {
                return res.status(400).json(error.message);
            }

            return res.status(500).json("Error interno del servidor.");
        }
    }

    /**
     * Eliminar gasto de alquiler por ID
     * @param {number|string} id ID del gasto
     * @returns {Array} Confirmación o vacío si no existe o falla
     */
    static async deleteRentalExpenses(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json('La ID es invalido.')
            }
            const deletedExpenses = await RentalExpensesServices.deleteRentalExpenses(id);
            if (!deletedExpenses.length) {
                return res.status(404).json('Error para al eliminar.')
            }
            return res.status(200).json('Elimando correctamente.');

        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }
    };

    // ========================================
    // LÓGICA DE NEGOCIO COMPLEJA
    // ========================================

    /**
     * Obtener todos los abonos
     */
    static async getAllRefunds(req, res) {
        try {
            const refunds = await RentalExpensesServices.getAllRefunds();
            if (!refunds.length) {
                return res.status(404).json('No existen abonos registrados.');
            }
            return res.status(200).json(refunds);
        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }
    }

    /**
     * Crear abono basado en gasto original
     */
    static async createRefund(req, res) {
        try {
            const {originalExpenseId, refundReason} = req.body;

            if (!originalExpenseId) {
                return res.status(400).json('ID del gasto original es requerido.');
            }

            const refund = await RentalExpensesServices.createRefund(originalExpenseId, refundReason);

            if (!refund.length) {
                return res.status(400).json('Error al crear abono o el gasto no existe.');
            }

            return res.status(201).json(refund);
        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }
    }

    /**
     * Obtener abono por ID con detalles
     */
    static async getRefundById(req, res) {
        try {
            const {id} = req.params;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json('La ID es inválida.');
            }

            const refund = await RentalExpensesServices.getRentalExpenseById(id);
            if (!refund.length) {
                return res.status(404).json('Abono no encontrado.');
            }

            // Verificar que sea un abono
            if (!refund[0].is_refund) {
                return res.status(400).json('El ID no corresponde a un abono.');
            }

            return res.status(200).json(refund);
        } catch (error) {
            return res.status(500).json("Error interno del servidor.");
        }
    }

    // ==============
    // MÉTODOS PDF
    // ==============


    /**
     * Genera y descarga PDF de un gasto específico
     * CORREGIDO: Service sin mensajes, Controller con mensajes
     */
    static async downloadExpensePdf(req, res) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json('ID inválido');
            }

            // SERVICE SOLO RETORNA DATOS O NULL
            const expense = await RentalExpensesServices.getExpenseForPdf(id);
            if (!expense) {
                return res.status(404).json('Gasto no encontrado o es un abono');
            }

            // OBTENER DETALLES COMPLETOS
            const expenseDetails = await RentalExpensesServices.getExpenseWithDetails(id);
            if (!expenseDetails) {
                return res.status(500).json('Error al procesar el gasto');
            }

            // CREAR DIRECTORIO
            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {recursive: true});
            }

            // GENERAR NOMBRE DE ARCHIVO
            const fileName = RentalExpensesServices.generatePdfFileName(expenseDetails, 'gasto');
            const filePath = path.join(dir, fileName);

            // GENERAR PDF
            await generateExpensePdf(expenseDetails, filePath);

            // VERIFICAR QUE EL ARCHIVO SE CREÓ
            if (!fs.existsSync(filePath)) {
                console.error('❌ El archivo PDF no se generó:', filePath);
                return res.status(500).json('Error al generar el archivo PDF');
            }

            console.log('✅ PDF generado correctamente:', filePath);

            // 🆕 CONFIGURAR HEADERS CORRECTOS PARA PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', fs.statSync(filePath).size);

            // 🆕 ENVIAR ARCHIVO COMO STREAM
            const fileStream = fs.createReadStream(filePath);

            fileStream.on('error', (err) => {
                console.error('❌ Error al leer el archivo PDF:', err);
                if (!res.headersSent) {
                    return res.status(500).json('Error al leer el archivo PDF');
                }
            });

            fileStream.on('end', () => {
                console.log('✅ PDF enviado correctamente');
            });

            // Enviar el stream al cliente
            fileStream.pipe(res);


        } catch (error) {
            console.error('❌ Error en downloadExpensePdf:', error);
            if (!res.headersSent) {
                return res.status(500).json('Error interno del servidor');
            }
        }
    }

    /**
     * Genera y descarga PDF de un abono específico
     * CORREGIDO: Service sin mensajes, Controller con mensajes
     */
    static async downloadRefundPdf(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json('ID inválido');
            }

            const refund = await RentalExpensesServices.getRefundForPdf(id);
            if (!refund) {
                return res.status(404).json('Abono no encontrado');
            }

            const refundDetails = await RentalExpensesServices.getRefundWithDetails(id);
            if (!refundDetails) {
                return res.status(500).json('Error al procesar el abono');
            }

            const dir = path.resolve('./pdfs');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const fileName = RentalExpensesServices.generatePdfFileName(refundDetails, 'abono');
            const filePath = path.join(dir, fileName);

            await generateExpensesRefundPdf(refundDetails, filePath);

            if (!fs.existsSync(filePath)) {
                console.error('❌ El archivo PDF de abono no se generó:', filePath);
                return res.status(500).json('Error al generar el archivo PDF del abono');
            }

            console.log('✅ PDF de abono generado correctamente:', filePath);

            // 🆕 CONFIGURAR HEADERS CORRECTOS PARA PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', fs.statSync(filePath).size);

            // 🆕 ENVIAR ARCHIVO COMO STREAM
            const fileStream = fs.createReadStream(filePath);

            fileStream.on('error', (err) => {
                console.error('❌ Error al leer el archivo PDF de abono:', err);
                if (!res.headersSent) {
                    return res.status(500).json('Error al leer el archivo PDF');
                }
            });

            fileStream.on('end', () => {
                console.log('✅ PDF de abono enviado correctamente');
            });

            fileStream.pipe(res);

        } catch (error) {
            console.error('❌ Error en downloadRefundPdf:', error);
            if (!res.headersSent) {
                return res.status(500).json('Error interno del servidor');
            }
        }
    }

    /**
     * Obtener gasto con detalles completos
     * REFACTORIZADO: Solo manejo HTTP, lógica en Service
     */
    static async getExpenseWithDetails(req, res) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json('ID inválido');
            }

            const expenseDetails = await RentalExpensesServices.getExpenseWithDetails(id);

            if (!expenseDetails) {
                return res.status(404).json('Gasto no encontrado');
            }

            return res.status(200).json(expenseDetails);

        } catch (error) {
            console.error('Error en getExpenseWithDetails:', error);
            return res.status(500).json('Error interno del servidor');
        }
    }

    /**
     * Obtener abono con detalles completos
     * REFACTORIZADO: Solo manejo HTTP, lógica en Service
     */
    static async getRefundWithDetails(req, res) {
        try {
            const {id} = req.params;

            // DELEGAR TODO AL SERVICE
            const refundDetails = await RentalExpensesServices.getRefundWithDetails(id);

            if (!refundDetails) {
                return res.status(404).json('Abono no encontrado o ID inválido');
            }

            return res.status(200).json(refundDetails);

        } catch (error) {
            console.error('Error en getRefundWithDetails:', error);
            return res.status(500).json('Error interno del servidor');
        }
    }

    /**
     * Buscar gasto por número de expense
     * NUEVO MÉTODO REFACTORIZADO
     */
    static async getByExpenseNumber(req, res) {
        try {
            const {expense_number} = req.params;

            if (!expense_number || expense_number.trim().length === 0) {
                return res.status(400).json('Número de gasto requerido');
            }

            // DELEGAR AL SERVICE
            const expense = await RentalExpensesServices.getByExpenseNumber(expense_number.trim());

            if (!expense.length) {
                return res.status(404).json('Gasto no encontrado con ese número');
            }

            return res.status(200).json(expense);

        } catch (error) {
            console.error('Error en getByExpenseNumber:', error);
            return res.status(500).json('Error interno del servidor');
        }
    }

    /**
     * Obtener resumen de gastos vs abonos por propiedad
     * NUEVO MÉTODO - LÓGICA EN SERVICE
     */
    static async getExpenseSummaryByProperty(req, res) {
        try {
            const {property_name} = req.params;

            if (!property_name || property_name.trim().length === 0) {
                return res.status(400).json('Nombre de propiedad requerido');
            }

            // DELEGAR AL SERVICE
            const summary = await RentalExpensesServices.getExpenseSummaryByProperty(property_name.trim());

            if (!summary) {
                return res.status(404).json('No se encontraron gastos para esa propiedad');
            }

            return res.status(200).json(summary);

        } catch (error) {
            console.error('Error en getExpenseSummaryByProperty:', error);
            return res.status(500).json('Error interno del servidor');
        }
    }

    /**
     * Obtener balance neto por período
     * NUEVO MÉTODO - LÓGICA EN SERVICE
     */
    static async getNetBalanceByPeriod(req, res) {
        try {
            const {startDate, endDate, propertyName} = req.body;

            if (!startDate || !endDate) {
                return res.status(400).json('Fechas de inicio y fin son requeridas');
            }

            // VALIDAR FORMATO DE FECHAS
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json('Formato de fecha inválido');
            }

            if (start > end) {
                return res.status(400).json('La fecha de inicio no puede ser mayor que la de fin');
            }

            // DELEGAR AL SERVICE
            const balance = await RentalExpensesServices.getNetBalanceByPeriod({
                startDate,
                endDate,
                propertyName: propertyName || null
            });

            if (!balance) {
                return res.status(404).json('No se encontraron datos para el período especificado');
            }

            return res.status(200).json(balance);

        } catch (error) {
            console.error('Error en getNetBalanceByPeriod:', error);
            return res.status(500).json('Error interno del servidor');
        }
    }

    // ========================================
    //  NUEVOS ENDPOINTS PARA FUNCIONALIDAD PROPORCIONAL
    // ========================================
    /**
     * 🆕 Obtiene detalles del cálculo proporcional de un gasto
     */
    static async getProportionalCalculationDetails(req, res) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de gasto inválido");
            }

            const details = await RentalExpensesServices.getProportionalCalculationDetails(Number(id));

            if (!details) {
                return res.status(404).json("Gasto no encontrado");
            }

            return res.status(200).json(details);

        } catch (error) {
            console.error('Error en getProportionalCalculationDetails:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * 🆕 Valida un rango de fechas para gastos proporcionales
     */
    static async validateProportionalDateRange(req, res) {
        try {
            const {start_date, end_date} = req.body;

            if (!start_date || !end_date) {
                return res.status(400).json({
                    isValid: false,
                    message: "Fechas de inicio y fin son requeridas"
                });
            }

            // Usar el helper directamente para validación
            const {CalculateHelper} = await import("../helpers/calculateTotal.js");
            const validation = CalculateHelper.validateDateRange(start_date, end_date);

            if (validation.isValid) {
                const periodDescription = CalculateHelper.generatePeriodDescription(start_date, end_date);

                return res.status(200).json({
                    ...validation,
                    periodDescription
                });
            } else {
                return res.status(400).json(validation);
            }

        } catch (error) {
            console.error('Error en validateProportionalDateRange:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * 🆕 Calcula una simulación de gasto proporcional sin guardarlo
     */
    static async simulateProportionalExpense(req, res) {
        try {
            const {
                monthly_rent, electricity, gas, water,
                community_fees, insurance, waste_tax, others,
                start_date, end_date
            } = req.body;

            // Validar que al menos un campo de gasto tenga valor
            const hasExpenseValue = [monthly_rent, electricity, gas, water, community_fees, insurance, waste_tax, others]
                .some(value => value && parseFloat(value) > 0);

            if (!hasExpenseValue) {
                return res.status(400).json("Debe especificar al menos un gasto mayor a 0");
            }

            if (!start_date || !end_date) {
                return res.status(400).json("Fechas de inicio y fin son requeridas");
            }

            // Preparar datos para simulación
            const expenseData = {
                monthly_rent: parseFloat(monthly_rent) || 0,
                electricity: parseFloat(electricity) || 0,
                gas: parseFloat(gas) || 0,
                water: parseFloat(water) || 0,
                community_fees: parseFloat(community_fees) || 0,
                insurance: parseFloat(insurance) || 0,
                waste_tax: parseFloat(waste_tax) || 0,
                others: parseFloat(others) || 0,
                is_proportional: 1,
                start_date,
                end_date
            };

            // Calcular usando el helper
            const {CalculateHelper} = await import("../helpers/calculateTotal.js");
            const calculation = CalculateHelper.calculateExpenseTotal(expenseData);
            const periodDescription = CalculateHelper.generatePeriodDescription(start_date, end_date);

            return res.status(200).json({
                ...calculation,
                periodDescription,
                simulation: true
            });

        } catch (error) {
            console.error('Error en simulateProportionalExpense:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }

    /**
     * 🆕 Actualiza el estado de pago de un gasto
     */
    static async updatePaymentStatus(req, res) {
        try {
            const {id} = req.params;
            const {payment_status, payment_method, payment_date, payment_notes} = req.body;

            // Validar ID de gasto
            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de gasto inválido");
            }

            // Validar que se envíen los datos requeridos
            if (!payment_status || !payment_method) {
                return res.status(400).json("Estado y método de pago son requeridos");
            }

            // Preparar datos para actualizar
            const paymentData = {
                payment_status,
                payment_method,
                payment_date: payment_date || null,
                payment_notes: payment_notes || null
            };

            // Actualizar usando el servicio
            const updated = await RentalExpensesServices.updatePaymentStatus(Number(id), paymentData);

            if (!updated || updated.length === 0) {
                return res.status(400).json("Error al actualizar el estado de pago");
            }

            return res.status(200).json({
                message: "Estado de pago actualizado correctamente",
                expense: updated
            });

        } catch (error) {
            console.error('Error en updatePaymentStatus:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }


}