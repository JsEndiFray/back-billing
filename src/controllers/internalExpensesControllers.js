/**
 * @fileoverview Controlador para la gestión de gastos internos de la empresa
 *
 * Maneja todas las operaciones CRUD relacionadas con gastos internos,
 * incluyendo búsquedas específicas, gestión de estados, gastos recurrentes
 * y generación de reportes.
 *
 * @requires path
 * @requires fs
 * @requires ../services/internalExpensesServices.js
 * @requires ../shared/helpers/calculateTotal.js
 * @author Tu Nombre
 * @since 1.0.0
 */

import fs from 'fs';
import InternalExpensesService from '../services/internalExpensesServices.js';
import {localFileService} from "../services/fileService.js";
import {
    createExpenseDTO,
    updateExpenseDTO,
    expenseDateRangeDTO,
    advancedSearchDTO,
    approvalDTO,
    expenseStatusDTO,
    validateDateRangeDTO,
    simulationDTO,
} from '../dto/internalExpense.dto.js';

/**
 * Controlador para la gestión de gastos internos de la empresa
 *
 * Proporciona endpoints para todas las operaciones relacionadas con
 * el sistema de gastos internos, desde consultas básicas hasta gestión
 * de estados y reportes.
 */
export default class InternalExpensesController {

    // ==========================================
    // CONSULTAS BÁSICAS (GET)
    // ==========================================

    /**
     * Obtiene todos los gastos internos del sistema
     *
     * @async
     * @function getAllExpenses
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses
     * // Response: [{ id: 1, description: "Material oficina", amount: 150.50, ... }]
     */
    static async getAllExpenses(req, res, next) {
        try {
            const expenses = await InternalExpensesService.getAllExpenses();

            if (!expenses || expenses.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron gastos internos" });
            }

            return res.status(200).json({ success: true, data: expenses });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene un gasto específico por su ID
     *
     * @async
     * @function getExpenseById
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/123
     * // Response: { id: 123, description: "Licencia software", ... }
     */
    static async getExpenseById(req, res, next) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de gasto inválido" });
            }

            const expense = await InternalExpensesService.getExpenseById(id);

            if (!expense || expense.length === 0) {
                return res.status(404).json({ success: false, message: "Gasto no encontrado" });
            }

            return res.status(200).json({ success: true, data: expense[0] });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // BÚSQUEDAS ESPECÍFICAS
    // ==========================================

    /**
     * Busca gastos por categoría
     *
     * @async
     * @function getExpensesByCategory
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/category/office_supplies
     * // Response: [{ id: 1, category: "office_supplies", ... }, ...]
     */
    static async getExpensesByCategory(req, res, next) {
        try {
            const {category} = req.params;

            if (!category || category.trim().length === 0) {
                return res.status(400).json({ success: false, message: "Categoría requerida" });
            }

            const expenses = await InternalExpensesService.getExpensesByCategory(category);

            if (!expenses || expenses.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron gastos para esta categoría" });
            }

            return res.status(200).json({ success: true, data: expenses });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Busca gastos por estado
     *
     * @async
     * @function getExpensesByStatus
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/status/pending
     * // Response: [{ id: 1, status: "pending", ... }, ...]
     */
    static async getExpensesByStatus(req, res, next) {
        try {
            const {status} = req.params;

            if (!status || status.trim().length === 0) {
                return res.status(400).json({ success: false, message: "Estado requerido" });
            }

            const expenses = await InternalExpensesService.getExpensesByStatus(status);

            if (!expenses || expenses.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron gastos con ese estado" });
            }

            return res.status(200).json({ success: true, data: expenses });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Busca gastos por proveedor
     *
     * @async
     * @function getExpensesBySupplier
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/supplier/Amazon%20Business
     * // Response: [{ id: 1, supplier_name: "Amazon Business", ... }, ...]
     */
    static async getExpensesBySupplier(req, res, next) {
        try {
            const {supplier_name} = req.params;

            if (!supplier_name || supplier_name.trim().length === 0) {
                return res.status(400).json({ success: false, message: "Nombre de proveedor requerido" });
            }

            const expenses = await InternalExpensesService.getExpensesBySupplier(supplier_name);

            if (!expenses || expenses.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron gastos para este proveedor" });
            }

            return res.status(200).json({ success: true, data: expenses });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Busca gastos por rango de fechas
     *
     * @async
     * @function getExpensesByDateRange
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/internal-expenses/date-range
     * // Body: { startDate: "2024-01-01", endDate: "2024-12-31" }
     * // Response: [{ id: 1, expense_date: "2024-06-15", ... }, ...]
     */
    static async getExpensesByDateRange(req, res, next) {
        try {
            const { startDate, endDate } = expenseDateRangeDTO(req.body);

            if (!startDate || !endDate) {
                return res.status(400).json({ success: false, message: "Fechas de inicio y fin son requeridas" });
            }

            const expenses = await InternalExpensesService.getExpensesByDateRange(startDate, endDate);

            if (!expenses || expenses.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron gastos en ese rango de fechas" });
            }

            return res.status(200).json({ success: true, data: expenses });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene gastos deducibles
     *
     * @async
     * @function getDeductibleExpenses
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/deductible
     * // Response: [{ id: 1, is_deductible: true, ... }, ...]
     */
    static async getDeductibleExpenses(req, res, next) {
        try {
            const expenses = await InternalExpensesService.getDeductibleExpenses();

            if (!expenses || expenses.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron gastos deducibles" });
            }

            return res.status(200).json({ success: true, data: expenses });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene gastos recurrentes
     *
     * @async
     * @function getRecurringExpenses
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/recurring
     * // Response: [{ id: 1, is_recurring: true, recurrence_period: "monthly", ... }, ...]
     */
    static async getRecurringExpenses(req, res, next) {
        try {
            const expenses = await InternalExpensesService.getRecurringExpenses();

            if (!expenses || expenses.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron gastos recurrentes" });
            }

            return res.status(200).json({ success: true, data: expenses });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Búsqueda avanzada con múltiples filtros
     *
     * @async
     * @function getExpensesAdvanced
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/internal-expenses/advanced-search
     * // Body: { category: "office_supplies", status: "pending", min_amount: 100 }
     */
    static async getExpensesAdvanced(req, res, next) {
        try {
            const filters = advancedSearchDTO(req.body);
            const expenses = await InternalExpensesService.getExpensesAdvanced(filters);

            if (!expenses || expenses.length === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron gastos con los filtros especificados" });
            }

            return res.status(200).json({ success: true, data: expenses });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // OPERACIONES CRUD
    // ==========================================

    /**
     * Crea un nuevo gasto interno
     *
     * @async
     * @function createExpense
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/internal-expenses
     * // Body: {
     * //   expense_date: "2024-07-22",
     * //   category: "office_supplies",
     * //   description: "Material de oficina",
     * //   amount: 150.50,
     * //   supplier_name: "Amazon Business"
     * // }
     */

    /**
     * Crea un nuevo gasto interno
     */
    static async createExpense(req, res, next) {
        try {
            const dto = createExpenseDTO(req.body);

            // Manejar archivo adjunto si existe
            if (req.file) {
                try {
                    const fileUploadResult = await localFileService.uploadInvoiceFile(
                            req.file.buffer,
                            req.file.originalname,
                            dto.receipt_number || `expense-${Date.now()}`,
                            dto.expense_date,  // ⬅️ NUEVO: Pasar la fecha
                            'expenses'                    // ⬅️ NUEVO: Tipo de archivo
                        )
                    ;
                    dto.has_attachments = true;
                    dto.pdf_path = fileUploadResult.fileId;

                } catch (fileError) {
                    return next(fileError);
                }
            }

            const created = await InternalExpensesService.createExpense(dto);

            if (created === null || !created || created.length === 0) {
                return res.status(400).json({ success: false, message: "Error en los datos proporcionados o faltantes" });
            }

            return res.status(201).json({ success: true, data: created[0] });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualiza un gasto existente
     *
     * @async
     * @function updateExpense
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // PUT /api/internal-expenses/123
     * // Body: { amount: 200.75, category: "equipment_furniture" }
     */
    static async updateExpense(req, res, next) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID inválido" });
            }

            const dto = updateExpenseDTO(req.body);

            // Manejar archivo adjunto si existe
            if (req.file) {
                try {
                    const fileUploadResult = await localFileService.uploadInvoiceFile(
                        req.file.buffer,
                        req.file.originalname,
                        dto.receipt_number || `expense-${id}`,
                        dto.expense_date,  // ⬅️ NUEVO
                        'expenses'                    // ⬅️ NUEVO
                    );
                    dto.has_attachments = true;
                    dto.pdf_path = fileUploadResult.fileId;
                } catch (fileError) {
                    return next(fileError);
                }
            }

            const updated = await InternalExpensesService.updateExpense(Number(id), dto);

            if (updated === null || !updated || updated.length === 0) {
                return res.status(400).json({ success: false, message: "Error en los datos proporcionados" });
            }

            return res.status(200).json({ success: true, data: updated[0] });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Elimina un gasto del sistema
     *
     * @async
     * @function deleteExpense
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // DELETE /api/internal-expenses/123
     * // Response: 204 No Content
     */
    static async deleteExpense(req, res, next) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de gasto inválido" });
            }

            const deleted = await InternalExpensesService.deleteExpense(id);

            if (!deleted || deleted.length === 0) {
                return res.status(404).json({ success: false, message: "Gasto no encontrado" });
            }

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // GESTIÓN DE ESTADOS
    // ==========================================

    /**
     * Aprueba un gasto pendiente
     *
     * @async
     * @function approveExpense
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // PUT /api/internal-expenses/123/approve
     * // Body: { approved_by: "manager@company.com" }
     */
    static async approveExpense(req, res, next) {
        try {
            const {id} = req.params;
            const { approved_by } = approvalDTO(req.body);

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de gasto inválido" });
            }

            const approved = await InternalExpensesService.approveExpense(Number(id), approved_by);

            if (!approved || approved.length === 0) {
                return res.status(400).json({ success: false, message: "Error al aprobar gasto - solo se pueden aprobar gastos pendientes" });
            }

            return res.status(200).json({ success: true, data: approved[0] });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Rechaza un gasto pendiente
     *
     * @async
     * @function rejectExpense
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // PUT /api/internal-expenses/123/reject
     * // Body: { approved_by: "manager@company.com" }
     */
    static async rejectExpense(req, res, next) {
        try {
            const {id} = req.params;
            const { approved_by } = approvalDTO(req.body);

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de gasto inválido" });
            }

            const rejected = await InternalExpensesService.rejectExpense(Number(id), approved_by);

            if (!rejected || rejected.length === 0) {
                return res.status(400).json({ success: false, message: "Error al rechazar gasto - solo se pueden rechazar gastos pendientes" });
            }

            return res.status(200).json({ success: true, data: rejected[0] });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Marca un gasto como pagado
     *
     * @async
     * @function markExpenseAsPaid
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // PUT /api/internal-expenses/123/pay
     * // Response: { message: "Gasto marcado como pagado", expense: {...} }
     */
    static async markExpenseAsPaid(req, res, next) {
        try {
            const {id} = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de gasto inválido" });
            }

            const paid = await InternalExpensesService.markExpenseAsPaid(Number(id));

            if (!paid || paid.length === 0) {
                return res.status(400).json({ success: false, message: "Error al marcar como pagado - solo se pueden pagar gastos aprobados" });
            }

            return res.status(200).json({ success: true, data: paid[0] });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualiza el estado de un gasto
     *
     * @async
     * @function updateExpenseStatus
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // PUT /api/internal-expenses/123/status
     * // Body: { status: "approved", approved_by: "manager@company.com" }
     */
    static async updateExpenseStatus(req, res, next) {
        try {
            const {id} = req.params;
            const { status, approved_by } = expenseStatusDTO(req.body);

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: "ID de gasto inválido" });
            }

            if (!status) {
                return res.status(400).json({ success: false, message: "Estado requerido" });
            }

            const updated = await InternalExpensesService.updateExpenseStatus(Number(id), status, approved_by);

            if (!updated || updated.length === 0) {
                return res.status(400).json({ success: false, message: "Error al actualizar estado - transición no válida" });
            }

            return res.status(200).json({ success: true, data: updated[0] });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // ESTADÍSTICAS Y REPORTES
    // ==========================================

    /**
     * Obtiene estadísticas generales de gastos internos
     *
     * @async
     * @function getExpenseStats
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/stats
     * // Response: {
     * //   total_expenses: 150,
     * //   pending_expenses: 25,
     * //   total_amount: 45000.50,
     * //   approval_rate: 85
     * // }
     */
    static async getExpenseStats(req, res, next) {
        try {
            const stats = await InternalExpensesService.getExpenseStats();
            return res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene estadísticas por categoría
     *
     * @async
     * @function getStatsByCategory
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     */
    static async getStatsByCategory(req, res, next) {
        try {
            const stats = await InternalExpensesService.getStatsByCategory();

            if (!stats || stats.length === 0) {
                return res.status(404).json({ success: false, message: "No hay estadísticas disponibles" });
            }

            return res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene resumen mensual
     *
     * @async
     * @function getMonthlySummary
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/monthly-summary/2024
     * // Response: resumen mensual de gastos del año
     */
    static async getMonthlySummary(req, res, next) {
        try {
            const {year} = req.params;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json({ success: false, message: "Año requerido y debe ser válido" });
            }

            const monthlyData = await InternalExpensesService.getMonthlySummary(year);

            if (!monthlyData || monthlyData.length === 0) {
                return res.status(404).json({ success: false, message: "No hay datos de gastos para el año especificado" });
            }

            return res.status(200).json({ success: true, data: monthlyData });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene datos para el libro de IVA soportado
     *
     * @async
     * @function getVATBookData
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/vat-book/2024?month=7
     * // Response: datos del libro de IVA soportado
     */
    static async getVATBookData(req, res, next) {
        try {
            const {year} = req.params;
            const {month} = req.query;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json({ success: false, message: "Año requerido y debe ser válido" });
            }

            const vatData = await InternalExpensesService.getVATBookData(year, month);

            if (!vatData || vatData.length === 0) {
                return res.status(404).json({ success: false, message: "No hay datos de IVA para el período especificado" });
            }

            return res.status(200).json({ success: true, data: vatData });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // GASTOS RECURRENTES
    // ==========================================

    /**
     * Obtiene gastos recurrentes que necesitan ser procesados
     *
     * @async
     * @function getRecurringExpensesDue
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/recurring-due
     * // Response: gastos recurrentes pendientes de crear
     */
    static async getRecurringExpensesDue(req, res, next) {
        try {
            const expensesDue = await InternalExpensesService.getRecurringExpensesDue();

            if (!expensesDue || expensesDue.length === 0) {
                return res.status(404).json({ success: false, message: "No hay gastos recurrentes pendientes de procesar" });
            }

            return res.status(200).json({ success: true, data: expensesDue });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Procesa todos los gastos recurrentes pendientes
     *
     * @async
     * @function processRecurringExpenses
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/internal-expenses/process-recurring
     * // Response: { message: "Procesados 5 gastos recurrentes", processed: [...] }
     */
    static async processRecurringExpenses(req, res, next) {
        try {
            const processed = await InternalExpensesService.processRecurringExpenses();

            return res.status(200).json({ success: true, data: processed });
        } catch (error) {
            next(error);
        }
    }

    // ==========================================
    // ENDPOINTS AUXILIARES Y VALIDACIONES
    // ==========================================

    /**
     * Valida un rango de fechas para gastos
     *
     * @async
     * @function validateDateRange
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/internal-expenses/validate-dates
     * // Body: { start_date: "2024-01-01", end_date: "2024-12-31" }
     */
    static async validateDateRange(req, res, next) {
        try {
            const { start_date, end_date } = validateDateRangeDTO(req.body);

            if (!start_date || !end_date) {
                return res.status(400).json({ success: false, message: "Fechas de inicio y fin son requeridas" });
            }

            const validation = InternalExpensesService.validateDateRange(start_date, end_date);

            return res.status(validation.isValid ? 200 : 400).json(validation);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Simula el cálculo de un gasto con IVA
     *
     * @async
     * @function simulateExpenseCalculation
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // POST /api/internal-expenses/simulate-calculation
     * // Body: { amount: 1000, iva_percentage: 21 }
     */
    static async simulateExpenseCalculation(req, res, next) {
        try {
            const { amount, iva_percentage } = simulationDTO(req.body);

            if (!amount || amount <= 0) {
                return res.status(400).json({ success: false, message: "Importe debe ser mayor a 0" });
            }

            const result = InternalExpensesService.simulateCalculation(amount, iva_percentage || 21);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene las categorías disponibles
     *
     * @async
     * @function getAvailableCategories
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/categories
     * // Response: [{ value: "office_supplies", label: "Material de oficina" }, ...]
     */
    static async getAvailableCategories(req, res, next) {
        try {
            const categories = InternalExpensesService.getAvailableCategories();
            return res.status(200).json({ success: true, data: categories });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene los métodos de pago disponibles
     *
     * @async
     * @function getAvailablePaymentMethods
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/payment-methods
     * // Response: [{ value: "card", label: "Tarjeta de crédito/débito" }, ...]
     */
    static async getAvailablePaymentMethods(req, res, next) {
        try {
            const methods = InternalExpensesService.getAvailablePaymentMethods();
            return res.status(200).json({ success: true, data: methods });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene los estados disponibles
     *
     * @async
     * @function getAvailableStatuses
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/statuses
     * // Response: [{ value: "pending", label: "Pendiente", color: "warning" }, ...]
     */
    static async getAvailableStatuses(req, res, next) {
        try {
            const statuses = InternalExpensesService.getAvailableStatuses();
            return res.status(200).json({ success: true, data: statuses });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Descarga un archivo adjunto de gasto
     *
     * @async
     * @function downloadAttachment
     * @param {express.Request} req - Objeto de solicitud
     * @param {express.Response} res - Objeto de respuesta
     * @returns {Promise<void>}
     *
     * @example
     * // GET /api/internal-expenses/files/EXPENSE-001_2024-08-12.pdf
     * // Response: Archivo PDF para descarga
     */
    static async downloadAttachment(req, res, next) {
        try {
            const {fileName} = req.params;

            // Validar nombre de archivo
            if (!fileName || !fileName.endsWith('.pdf')) {
                return res.status(400).json({ success: false, message: "Nombre de archivo inválido" });
            }

            // Construir ruta del archivo
            const filePath = localFileService.getFilePath(fileName);

            // Verificar que el archivo existe
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ success: false, message: "Archivo no encontrado" });
            }

            // Enviar archivo para descarga
            res.download(filePath, fileName, (err) => {
                if (err && !res.headersSent) {
                    next(err);
                }
            });

        } catch (error) {
            next(error);
        }
    }
}