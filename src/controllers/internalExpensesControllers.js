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

import path from 'path';
import fs from 'fs';
import InternalExpensesService from '../services/internalExpensesServices.js';
import CalculateHelper from '../shared/helpers/calculateTotal.js';

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
    static async getAllExpenses(req, res) {
        try {
            const expenses = await InternalExpensesService.getAllExpenses();

            if (!expenses || expenses.length === 0) {
                return res.status(404).json("No se encontraron gastos internos");
            }

            return res.status(200).json(expenses);
        } catch (error) {
            console.error('Error en getAllExpenses:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getExpenseById(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de gasto inválido");
            }

            const expense = await InternalExpensesService.getExpenseById(id);

            if (!expense || expense.length === 0) {
                return res.status(404).json("Gasto no encontrado");
            }

            return res.status(200).json(expense[0]);
        } catch (error) {
            console.error('Error en getExpenseById:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getExpensesByCategory(req, res) {
        try {
            const { category } = req.params;

            if (!category || category.trim().length === 0) {
                return res.status(400).json("Categoría requerida");
            }

            const expenses = await InternalExpensesService.getExpensesByCategory(category);

            if (!expenses || expenses.length === 0) {
                return res.status(404).json("No se encontraron gastos para esta categoría");
            }

            return res.status(200).json(expenses);
        } catch (error) {
            console.error('Error en getExpensesByCategory:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getExpensesByStatus(req, res) {
        try {
            const { status } = req.params;

            if (!status || status.trim().length === 0) {
                return res.status(400).json("Estado requerido");
            }

            const expenses = await InternalExpensesService.getExpensesByStatus(status);

            if (!expenses || expenses.length === 0) {
                return res.status(404).json("No se encontraron gastos con ese estado");
            }

            return res.status(200).json(expenses);
        } catch (error) {
            console.error('Error en getExpensesByStatus:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getExpensesBySupplier(req, res) {
        try {
            const { supplier_name } = req.params;

            if (!supplier_name || supplier_name.trim().length === 0) {
                return res.status(400).json("Nombre de proveedor requerido");
            }

            const expenses = await InternalExpensesService.getExpensesBySupplier(supplier_name);

            if (!expenses || expenses.length === 0) {
                return res.status(404).json("No se encontraron gastos para este proveedor");
            }

            return res.status(200).json(expenses);
        } catch (error) {
            console.error('Error en getExpensesBySupplier:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getExpensesByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.body;

            if (!startDate || !endDate) {
                return res.status(400).json("Fechas de inicio y fin son requeridas");
            }

            const expenses = await InternalExpensesService.getExpensesByDateRange(startDate, endDate);

            if (!expenses || expenses.length === 0) {
                return res.status(404).json("No se encontraron gastos en ese rango de fechas");
            }

            return res.status(200).json(expenses);
        } catch (error) {
            console.error('Error en getExpensesByDateRange:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getDeductibleExpenses(req, res) {
        try {
            const expenses = await InternalExpensesService.getDeductibleExpenses();

            if (!expenses || expenses.length === 0) {
                return res.status(404).json("No se encontraron gastos deducibles");
            }

            return res.status(200).json(expenses);
        } catch (error) {
            console.error('Error en getDeductibleExpenses:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getRecurringExpenses(req, res) {
        try {
            const expenses = await InternalExpensesService.getRecurringExpenses();

            if (!expenses || expenses.length === 0) {
                return res.status(404).json("No se encontraron gastos recurrentes");
            }

            return res.status(200).json(expenses);
        } catch (error) {
            console.error('Error en getRecurringExpenses:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getExpensesAdvanced(req, res) {
        try {
            const filters = req.body;
            const expenses = await InternalExpensesService.getExpensesAdvanced(filters);

            if (!expenses || expenses.length === 0) {
                return res.status(404).json("No se encontraron gastos con los filtros especificados");
            }

            return res.status(200).json(expenses);
        } catch (error) {
            console.error('Error en getExpensesAdvanced:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async createExpense(req, res) {
        try {
            const data = req.body;
            const created = await InternalExpensesService.createExpense(data);

            if (!created || created.length === 0) {
                return res.status(400).json("Error al crear gasto interno - datos inválidos");
            }

            return res.status(201).json({
                message: "Gasto interno creado correctamente",
                expense: created[0]
            });
        } catch (error) {
            console.error('Error en createExpense:', error);
            if (error.message.includes('recurrente') || error.message.includes('IVA')) {
                return res.status(400).json(error.message);
            }
            return res.status(500).json("Error interno del servidor");
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
    static async updateExpense(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de gasto inválido");
            }

            // Verificar que el gasto existe
            const existing = await InternalExpensesService.getExpenseById(id);
            if (!existing || existing.length === 0) {
                return res.status(404).json("Gasto no encontrado");
            }

            const updated = await InternalExpensesService.updateExpense(Number(id), updateData);

            if (!updated || updated.length === 0) {
                return res.status(400).json("Error al actualizar gasto");
            }

            return res.status(200).json({
                message: "Gasto actualizado correctamente",
                expense: updated[0]
            });
        } catch (error) {
            console.error('Error en updateExpense:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async deleteExpense(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de gasto inválido");
            }

            const deleted = await InternalExpensesService.deleteExpense(id);

            if (!deleted || deleted.length === 0) {
                return res.status(400).json("Error al eliminar gasto - no encontrado o ya aprobado/pagado");
            }

            return res.status(204).send();
        } catch (error) {
            console.error('Error en deleteExpense:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async approveExpense(req, res) {
        try {
            const { id } = req.params;
            const { approved_by } = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de gasto inválido");
            }

            const approved = await InternalExpensesService.approveExpense(Number(id), approved_by);

            if (!approved || approved.length === 0) {
                return res.status(400).json("Error al aprobar gasto - solo se pueden aprobar gastos pendientes");
            }

            return res.status(200).json({
                message: "Gasto aprobado correctamente",
                expense: approved[0]
            });
        } catch (error) {
            console.error('Error en approveExpense:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async rejectExpense(req, res) {
        try {
            const { id } = req.params;
            const { approved_by } = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de gasto inválido");
            }

            const rejected = await InternalExpensesService.rejectExpense(Number(id), approved_by);

            if (!rejected || rejected.length === 0) {
                return res.status(400).json("Error al rechazar gasto - solo se pueden rechazar gastos pendientes");
            }

            return res.status(200).json({
                message: "Gasto rechazado correctamente",
                expense: rejected[0]
            });
        } catch (error) {
            console.error('Error en rejectExpense:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async markExpenseAsPaid(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de gasto inválido");
            }

            const paid = await InternalExpensesService.markExpenseAsPaid(Number(id));

            if (!paid || paid.length === 0) {
                return res.status(400).json("Error al marcar como pagado - solo se pueden pagar gastos aprobados");
            }

            return res.status(200).json({
                message: "Gasto marcado como pagado correctamente",
                expense: paid[0]
            });
        } catch (error) {
            console.error('Error en markExpenseAsPaid:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async updateExpenseStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, approved_by } = req.body;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json("ID de gasto inválido");
            }

            if (!status) {
                return res.status(400).json("Estado requerido");
            }

            const updated = await InternalExpensesService.updateExpenseStatus(Number(id), status, approved_by);

            if (!updated || updated.length === 0) {
                return res.status(400).json("Error al actualizar estado - transición no válida");
            }

            return res.status(200).json({
                message: "Estado actualizado correctamente",
                expense: updated[0]
            });
        } catch (error) {
            console.error('Error en updateExpenseStatus:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getExpenseStats(req, res) {
        try {
            const stats = await InternalExpensesService.getExpenseStats();
            return res.status(200).json(stats);
        } catch (error) {
            console.error('Error en getExpenseStats:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getStatsByCategory(req, res) {
        try {
            const stats = await InternalExpensesService.getStatsByCategory();

            if (!stats || stats.length === 0) {
                return res.status(404).json("No hay estadísticas disponibles");
            }

            return res.status(200).json(stats);
        } catch (error) {
            console.error('Error en getStatsByCategory:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getMonthlySummary(req, res) {
        try {
            const { year } = req.params;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json("Año requerido y debe ser válido");
            }

            const monthlyData = await InternalExpensesService.getMonthlySummary(year);

            if (!monthlyData || monthlyData.length === 0) {
                return res.status(404).json("No hay datos de gastos para el año especificado");
            }

            return res.status(200).json(monthlyData);
        } catch (error) {
            console.error('Error en getMonthlySummary:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getVATBookData(req, res) {
        try {
            const { year } = req.params;
            const { month } = req.query;

            if (!year || isNaN(Number(year))) {
                return res.status(400).json("Año requerido y debe ser válido");
            }

            const vatData = await InternalExpensesService.getVATBookData(year, month);

            if (!vatData || vatData.length === 0) {
                return res.status(404).json("No hay datos de IVA para el período especificado");
            }

            return res.status(200).json(vatData);
        } catch (error) {
            console.error('Error en getVATBookData:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getRecurringExpensesDue(req, res) {
        try {
            const expensesDue = await InternalExpensesService.getRecurringExpensesDue();

            if (!expensesDue || expensesDue.length === 0) {
                return res.status(404).json("No hay gastos recurrentes pendientes de procesar");
            }

            return res.status(200).json(expensesDue);
        } catch (error) {
            console.error('Error en getRecurringExpensesDue:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async processRecurringExpenses(req, res) {
        try {
            const processed = await InternalExpensesService.processRecurringExpenses();

            return res.status(200).json({
                message: `Procesados ${processed.length} gastos recurrentes`,
                processed: processed
            });
        } catch (error) {
            console.error('Error en processRecurringExpenses:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async validateDateRange(req, res) {
        try {
            const { start_date, end_date } = req.body;

            if (!start_date || !end_date) {
                return res.status(400).json({
                    isValid: false,
                    message: "Fechas de inicio y fin son requeridas"
                });
            }

            const validation = CalculateHelper.validateDateRange(start_date, end_date, {
                maxRangeYears: 2,
                allowFutureDates: false
            });

            return res.status(validation.isValid ? 200 : 400).json(validation);
        } catch (error) {
            console.error('Error en validateDateRange:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async simulateExpenseCalculation(req, res) {
        try {
            const { amount, iva_percentage } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).json("Importe debe ser mayor a 0");
            }

            const ivaPercentage = iva_percentage || 21;

            try {
                const ivaAmount = CalculateHelper.calculateIVA(amount, ivaPercentage);
                const totalAmount = parseFloat(amount) + ivaAmount;

                return res.status(200).json({
                    amount: parseFloat(amount),
                    iva_percentage: ivaPercentage,
                    iva_amount: ivaAmount,
                    total_amount: totalAmount,
                    simulation: true
                });
            } catch (calculationError) {
                return res.status(400).json(calculationError.message);
            }
        } catch (error) {
            console.error('Error en simulateExpenseCalculation:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getAvailableCategories(req, res) {
        try {
            const categories = CalculateHelper.getAvailableCategories();
            return res.status(200).json(categories);
        } catch (error) {
            console.error('Error en getAvailableCategories:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getAvailablePaymentMethods(req, res) {
        try {
            const methods = CalculateHelper.getAvailablePaymentMethods();
            return res.status(200).json(methods);
        } catch (error) {
            console.error('Error en getAvailablePaymentMethods:', error);
            return res.status(500).json("Error interno del servidor");
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
    static async getAvailableStatuses(req, res) {
        try {
            const statuses = CalculateHelper.getAvailableStatuses();
            return res.status(200).json(statuses);
        } catch (error) {
            console.error('Error en getAvailableStatuses:', error);
            return res.status(500).json("Error interno del servidor");
        }
    }
}