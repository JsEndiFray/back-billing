import express from 'express';
import InternalExpensesController from '../controllers/internalExpensesControllers.js';
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

/**
 * @swagger
 * tags:
 *   name: Gastos Internos
 *   description: API para gestión de gastos internos de la empresa
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GastoInterno:
 *       type: object
 *       required:
 *         - expense_date
 *         - category
 *         - description
 *         - amount
 *         - supplier_name
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-generado del gasto
 *         expense_date:
 *           type: string
 *           format: date
 *           description: Fecha del gasto
 *         category:
 *           type: string
 *           enum: [office_supplies, equipment_furniture, professional_services, utilities, maintenance_repairs, travel_transport, marketing_advertising, training_education, insurance, taxes_fees, rent_leasing, technology_software, legal_accounting, other]
 *           description: Categoría del gasto
 *         subcategory:
 *           type: string
 *           description: Subcategoría del gasto
 *         description:
 *           type: string
 *           description: Descripción del gasto
 *         amount:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *           description: Importe base del gasto
 *         iva_percentage:
 *           type: number
 *           format: float
 *           default: 21.00
 *           description: Porcentaje de IVA aplicado
 *         iva_amount:
 *           type: number
 *           format: float
 *           description: Importe del IVA (calculado automáticamente)
 *         total_amount:
 *           type: number
 *           format: float
 *           description: Importe total (base + IVA)
 *         is_deductible:
 *           type: boolean
 *           default: true
 *           description: Si el gasto es deducible fiscalmente
 *         supplier_name:
 *           type: string
 *           description: Nombre del proveedor
 *         supplier_nif:
 *           type: string
 *           description: NIF/CIF del proveedor
 *         supplier_address:
 *           type: string
 *           description: Dirección del proveedor
 *         payment_method:
 *           type: string
 *           enum: [card, transfer, cash, check, financing]
 *           default: card
 *           description: Método de pago utilizado
 *         receipt_number:
 *           type: string
 *           description: Número de factura o recibo
 *         receipt_date:
 *           type: string
 *           format: date
 *           description: Fecha de la factura
 *         pdf_path:
 *           type: string
 *           description: Ruta del archivo PDF adjunto
 *         has_attachments:
 *           type: boolean
 *           default: false
 *           description: Si tiene archivos adjuntos
 *         property_id:
 *           type: integer
 *           description: ID de la propiedad asociada (si aplica)
 *         project_code:
 *           type: string
 *           description: Código del proyecto asociado
 *         cost_center:
 *           type: string
 *           description: Centro de coste
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *         is_recurring:
 *           type: boolean
 *           default: false
 *           description: Si es un gasto recurrente
 *         recurrence_period:
 *           type: string
 *           enum: [monthly, quarterly, annually]
 *           description: Período de recurrencia (si aplica)
 *         next_occurrence_date:
 *           type: string
 *           format: date
 *           description: Próxima fecha de ocurrencia (si es recurrente)
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, paid]
 *           default: pending
 *           description: Estado del gasto
 *         created_by:
 *           type: string
 *           description: Usuario que creó el gasto
 *         approved_by:
 *           type: string
 *           description: Usuario que aprobó el gasto
 *         approval_date:
 *           type: string
 *           format: date
 *           description: Fecha de aprobación
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *       example:
 *         id: 1
 *         expense_date: "2024-07-30"
 *         category: "office_supplies"
 *         subcategory: "Material de oficina"
 *         description: "Papel y material de oficina"
 *         amount: 100.00
 *         iva_percentage: 21.00
 *         iva_amount: 21.00
 *         total_amount: 121.00
 *         is_deductible: true
 *         supplier_name: "Papelería Central"
 *         supplier_nif: "B12345678"
 *         payment_method: "card"
 *         status: "pending"
 *
 *     EstadisticasGastos:
 *       type: object
 *       properties:
 *         total_expenses:
 *           type: integer
 *           description: Total de gastos
 *         pending_expenses:
 *           type: integer
 *           description: Gastos pendientes
 *         approved_expenses:
 *           type: integer
 *           description: Gastos aprobados
 *         rejected_expenses:
 *           type: integer
 *           description: Gastos rechazados
 *         paid_expenses:
 *           type: integer
 *           description: Gastos pagados
 *         total_amount:
 *           type: number
 *           format: float
 *           description: Importe total
 *         total_iva_amount:
 *           type: number
 *           format: float
 *           description: Total IVA
 *         approval_rate:
 *           type: integer
 *           description: Tasa de aprobación en porcentaje
 *
 *     FiltrosBusquedaAvanzada:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *           description: Filtrar por categoría
 *         status:
 *           type: string
 *           description: Filtrar por estado
 *         supplier_name:
 *           type: string
 *           description: Filtrar por proveedor
 *         start_date:
 *           type: string
 *           format: date
 *           description: Fecha de inicio
 *         end_date:
 *           type: string
 *           format: date
 *           description: Fecha de fin
 *         min_amount:
 *           type: number
 *           format: float
 *           description: Importe mínimo
 *         max_amount:
 *           type: number
 *           format: float
 *           description: Importe máximo
 *         is_deductible:
 *           type: boolean
 *           description: Filtrar por deducibilidad
 *         property_id:
 *           type: integer
 *           description: Filtrar por propiedad
 *       example:
 *         category: "office_supplies"
 *         status: "approved"
 *         start_date: "2024-01-01"
 *         end_date: "2024-12-31"
 *         min_amount: 100
 *         is_deductible: true
 */

const router = express.Router()

    // ==========================================
    // ESTADÍSTICAS Y REPORTES (GET)
    // ==========================================

    /**
     * @swagger
     * /internal-expenses/stats:
     *   get:
     *     summary: Obtiene estadísticas generales de gastos internos
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Estadísticas de gastos internos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/EstadisticasGastos'
     *       401:
     *         description: No autorizado
     *       500:
     *         description: Error interno del servidor
     */
    .get('/stats', auth, role(['admin', 'employee']), InternalExpensesController.getExpenseStats)

    /**
     * @swagger
     * /internal-expenses/stats/category:
     *   get:
     *     summary: Obtiene estadísticas por categoría
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Estadísticas por categoría
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   category:
     *                     type: string
     *                   expense_count:
     *                     type: integer
     *                   total_amount:
     *                     type: number
     *                   average_amount:
     *                     type: number
     *       404:
     *         description: No hay estadísticas disponibles
     */
    .get('/stats/category', auth, role(['admin', 'employee']), InternalExpensesController.getStatsByCategory)

    /**
     * @swagger
     * /internal-expenses/deductible:
     *   get:
     *     summary: Obtiene gastos deducibles
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de gastos deducibles
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/GastoInterno'
     *       404:
     *         description: No se encontraron gastos deducibles
     */
    .get('/deductible', auth, role(['admin', 'employee']), InternalExpensesController.getDeductibleExpenses)

    /**
     * @swagger
     * /internal-expenses/recurring:
     *   get:
     *     summary: Obtiene gastos recurrentes
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de gastos recurrentes
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/GastoInterno'
     *       404:
     *         description: No se encontraron gastos recurrentes
     */
    .get('/recurring', auth, role(['admin', 'employee']), InternalExpensesController.getRecurringExpenses)

    /**
     * @swagger
     * /internal-expenses/recurring-due:
     *   get:
     *     summary: Obtiene gastos recurrentes pendientes de procesar
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Gastos recurrentes pendientes
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/GastoInterno'
     *       404:
     *         description: No hay gastos recurrentes pendientes de procesar
     */
    .get('/recurring-due', auth, role(['admin', 'employee']), InternalExpensesController.getRecurringExpensesDue)

    /**
     * @swagger
     * /internal-expenses/categories:
     *   get:
     *     summary: Obtiene las categorías disponibles
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de categorías disponibles
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   value:
     *                     type: string
     *                   label:
     *                     type: string
     */
    .get('/categories', auth, role(['admin', 'employee']), InternalExpensesController.getAvailableCategories)

    /**
     * @swagger
     * /internal-expenses/payment-methods:
     *   get:
     *     summary: Obtiene los métodos de pago disponibles
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de métodos de pago disponibles
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   value:
     *                     type: string
     *                   label:
     *                     type: string
     */
    .get('/payment-methods', auth, role(['admin', 'employee']), InternalExpensesController.getAvailablePaymentMethods)

    /**
     * @swagger
     * /internal-expenses/statuses:
     *   get:
     *     summary: Obtiene los estados disponibles
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de estados disponibles
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   value:
     *                     type: string
     *                   label:
     *                     type: string
     *                   color:
     *                     type: string
     */
    .get('/statuses', auth, role(['admin', 'employee']), InternalExpensesController.getAvailableStatuses)

    // ==========================================
    // BÚSQUEDAS POR PARÁMETROS (GET)
    // ==========================================

    /**
     * @swagger
     * /internal-expenses/category/{category}:
     *   get:
     *     summary: Obtiene gastos por categoría
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: category
     *         required: true
     *         schema:
     *           type: string
     *           enum: [office_supplies, equipment_furniture, professional_services, utilities, maintenance_repairs, travel_transport, marketing_advertising, training_education, insurance, taxes_fees, rent_leasing, technology_software, legal_accounting, other]
     *         description: Categoría del gasto
     *     responses:
     *       200:
     *         description: Gastos encontrados por categoría
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/GastoInterno'
     *       404:
     *         description: No se encontraron gastos para esta categoría
     */
    .get('/category/:category', auth, role(['admin', 'employee']), InternalExpensesController.getExpensesByCategory)

    /**
     * @swagger
     * /internal-expenses/status/{status}:
     *   get:
     *     summary: Obtiene gastos por estado
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: status
     *         required: true
     *         schema:
     *           type: string
     *           enum: [pending, approved, rejected, paid]
     *         description: Estado del gasto
     *     responses:
     *       200:
     *         description: Gastos encontrados por estado
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/GastoInterno'
     *       404:
     *         description: No se encontraron gastos con ese estado
     */
    .get('/status/:status', auth, role(['admin', 'employee']), InternalExpensesController.getExpensesByStatus)

    /**
     * @swagger
     * /internal-expenses/supplier/{supplier_name}:
     *   get:
     *     summary: Obtiene gastos por proveedor
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: supplier_name
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre del proveedor
     *     responses:
     *       200:
     *         description: Gastos encontrados por proveedor
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/GastoInterno'
     *       404:
     *         description: No se encontraron gastos para este proveedor
     */
    .get('/supplier/:supplier_name', auth, role(['admin', 'employee']), InternalExpensesController.getExpensesBySupplier)

    /**
     * @swagger
     * /internal-expenses/monthly-summary/{year}:
     *   get:
     *     summary: Obtiene resumen mensual de gastos por año
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: year
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 2020
     *           maximum: 2030
     *         description: Año para el resumen (formato YYYY)
     *     responses:
     *       200:
     *         description: Resumen mensual del año especificado
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   month:
     *                     type: integer
     *                   month_name:
     *                     type: string
     *                   expense_count:
     *                     type: integer
     *                   total_amount:
     *                     type: number
     *                   total_iva:
     *                     type: number
     *       400:
     *         description: Año requerido y debe ser válido
     *       404:
     *         description: No hay datos de gastos para el año especificado
     */
    .get('/monthly-summary/:year', auth, role(['admin', 'employee']), InternalExpensesController.getMonthlySummary)

    /**
     * @swagger
     * /internal-expenses/vat-book/{year}:
     *   get:
     *     summary: Obtiene datos para el libro de IVA soportado
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: year
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 2020
     *           maximum: 2030
     *         description: Año para el libro de IVA
     *       - in: query
     *         name: month
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 12
     *         description: Mes específico (opcional)
     *     responses:
     *       200:
     *         description: Datos del libro de IVA soportado
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   expense_date:
     *                     type: string
     *                     format: date
     *                   supplier_name:
     *                     type: string
     *                   supplier_nif:
     *                     type: string
     *                   tax_base:
     *                     type: number
     *                   iva_percentage:
     *                     type: number
     *                   iva_amount:
     *                     type: number
     *                   total_amount:
     *                     type: number
     *                   is_deductible:
     *                     type: boolean
     *       400:
     *         description: Año requerido y debe ser válido
     *       404:
     *         description: No hay datos de IVA para el período especificado
     */
    .get('/vat-book/:year', auth, role(['admin', 'employee']), InternalExpensesController.getVATBookData)

    // RUTA GET GENÉRICA - DEBE IR AL FINAL DE LAS RUTAS GET CON PARÁMETROS

    /**
     * @swagger
     * /internal-expenses:
     *   get:
     *     summary: Obtiene todos los gastos internos
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de todos los gastos internos
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/GastoInterno'
     *       404:
     *         description: No se encontraron gastos internos
     */
    .get('/', auth, role(['admin', 'employee']), InternalExpensesController.getAllExpenses)

    /**
     * @swagger
     * /internal-expenses/{id}:
     *   get:
     *     summary: Obtiene un gasto interno por ID
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del gasto interno
     *     responses:
     *       200:
     *         description: Gasto interno encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/GastoInterno'
     *       400:
     *         description: ID de gasto inválido
     *       404:
     *         description: Gasto no encontrado
     */
    .get('/:id', auth, role(['admin', 'employee']), InternalExpensesController.getExpenseById)

    // ==========================================
    // OPERACIONES POST (SOLO ADMIN)
    // ==========================================

    /**
     * @swagger
     * /internal-expenses:
     *   post:
     *     summary: Crea un nuevo gasto interno
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/GastoInterno'
     *           example:
     *             expense_date: "2024-07-30"
     *             category: "office_supplies"
     *             description: "Material de oficina"
     *             amount: 100.00
     *             supplier_name: "Papelería Central"
     *             iva_percentage: 21.00
     *             is_deductible: true
     *             payment_method: "card"
     *     responses:
     *       201:
     *         description: Gasto interno creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 expense:
     *                   $ref: '#/components/schemas/GastoInterno'
     *       400:
     *         description: Error al crear gasto interno - datos inválidos
     *       401:
     *         description: No autorizado
     *       403:
     *         description: No tiene permiso
     */
    .post('/', auth, role(['admin']), InternalExpensesController.createExpense)

    /**
     * @swagger
     * /internal-expenses/date-range:
     *   post:
     *     summary: Busca gastos por rango de fechas
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - startDate
     *               - endDate
     *             properties:
     *               startDate:
     *                 type: string
     *                 format: date
     *                 description: Fecha de inicio
     *               endDate:
     *                 type: string
     *                 format: date
     *                 description: Fecha de fin
     *           example:
     *             startDate: "2024-01-01"
     *             endDate: "2024-12-31"
     *     responses:
     *       200:
     *         description: Gastos encontrados en el rango de fechas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/GastoInterno'
     *       400:
     *         description: Fechas de inicio y fin son requeridas
     *       404:
     *         description: No se encontraron gastos en ese rango de fechas
     */
    .post('/date-range', auth, role(['admin', 'employee']), InternalExpensesController.getExpensesByDateRange)

    /**
     * @swagger
     * /internal-expenses/advanced-search:
     *   post:
     *     summary: Búsqueda avanzada con múltiples filtros
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/FiltrosBusquedaAvanzada'
     *     responses:
     *       200:
     *         description: Gastos encontrados con los filtros especificados
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/GastoInterno'
     *       404:
     *         description: No se encontraron gastos con los filtros especificados
     */
    .post('/advanced-search', auth, role(['admin', 'employee']), InternalExpensesController.getExpensesAdvanced)

    /**
     * @swagger
     * /internal-expenses/process-recurring:
     *   post:
     *     summary: Procesa todos los gastos recurrentes pendientes
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Gastos recurrentes procesados exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Procesados 5 gastos recurrentes"
     *                 processed:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/GastoInterno'
     *       401:
     *         description: No autorizado
     *       403:
     *         description: No tiene permiso
     */
    .post('/process-recurring', auth, role(['admin']), InternalExpensesController.processRecurringExpenses)

    /**
     * @swagger
     * /internal-expenses/validate-dates:
     *   post:
     *     summary: Valida un rango de fechas para gastos
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - start_date
     *               - end_date
     *             properties:
     *               start_date:
     *                 type: string
     *                 format: date
     *               end_date:
     *                 type: string
     *                 format: date
     *           example:
     *             start_date: "2024-01-01"
     *             end_date: "2024-12-31"
     *     responses:
     *       200:
     *         description: Validación exitosa
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isValid:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       400:
     *         description: Validación fallida o fechas inválidas
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isValid:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Fechas de inicio y fin son requeridas"
     */
    .post('/validate-dates', auth, role(['admin', 'employee']), InternalExpensesController.validateDateRange)

    /**
     * @swagger
     * /internal-expenses/simulate-calculation:
     *   post:
     *     summary: Simula el cálculo de un gasto con IVA
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - amount
     *             properties:
     *               amount:
     *                 type: number
     *                 format: float
     *                 minimum: 0.01
     *                 description: Importe base del gasto
     *               iva_percentage:
     *                 type: number
     *                 format: float
     *                 default: 21.00
     *                 description: Porcentaje de IVA a aplicar
     *           example:
     *             amount: 1000
     *             iva_percentage: 21
     *     responses:
     *       200:
     *         description: Simulación de cálculo exitosa
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 amount:
     *                   type: number
     *                   format: float
     *                 iva_percentage:
     *                   type: number
     *                   format: float
     *                 iva_amount:
     *                   type: number
     *                   format: float
     *                 total_amount:
     *                   type: number
     *                   format: float
     *                 simulation:
     *                   type: boolean
     *                   example: true
     *       400:
     *         description: Importe debe ser mayor a 0 o error en cálculo
     */
    .post('/simulate-calculation', auth, role(['admin', 'employee']), InternalExpensesController.simulateExpenseCalculation)

    // ==========================================
    // OPERACIONES PUT (SOLO ADMIN)
    // ==========================================

    /**
     * @swagger
     * /internal-expenses/{id}:
     *   put:
     *     summary: Actualiza un gasto interno existente
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del gasto interno
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/GastoInterno'
     *           example:
     *             amount: 150.00
     *             description: "Material de oficina actualizado"
     *             category: "office_supplies"
     *     responses:
     *       200:
     *         description: Gasto interno actualizado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 expense:
     *                   $ref: '#/components/schemas/GastoInterno'
     *       400:
     *         description: ID de gasto inválido o error al actualizar
     *       401:
     *         description: No autorizado
     *       403:
     *         description: No tiene permiso
     *       404:
     *         description: Gasto no encontrado
     */
    .put('/:id', auth, role(['admin']), InternalExpensesController.updateExpense)

    /**
     * @swagger
     * /internal-expenses/{id}/approve:
     *   put:
     *     summary: Aprueba un gasto pendiente
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del gasto interno
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               approved_by:
     *                 type: string
     *                 description: Usuario que aprueba el gasto
     *           example:
     *             approved_by: "manager@company.com"
     *     responses:
     *       200:
     *         description: Gasto aprobado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 expense:
     *                   $ref: '#/components/schemas/GastoInterno'
     *       400:
     *         description: Error al aprobar gasto - solo se pueden aprobar gastos pendientes
     *       401:
     *         description: No autorizado
     *       403:
     *         description: No tiene permiso
     */
    .put('/:id/approve', auth, role(['admin']), InternalExpensesController.approveExpense)

    /**
     * @swagger
     * /internal-expenses/{id}/reject:
     *   put:
     *     summary: Rechaza un gasto pendiente
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del gasto interno
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               approved_by:
     *                 type: string
     *                 description: Usuario que rechaza el gasto
     *           example:
     *             approved_by: "manager@company.com"
     *     responses:
     *       200:
     *         description: Gasto rechazado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 expense:
     *                   $ref: '#/components/schemas/GastoInterno'
     *       400:
     *         description: Error al rechazar gasto - solo se pueden rechazar gastos pendientes
     *       401:
     *         description: No autorizado
     *       403:
     *         description: No tiene permiso
     */
    .put('/:id/reject', auth, role(['admin']), InternalExpensesController.rejectExpense)

    /**
     * @swagger
     * /internal-expenses/{id}/pay:
     *   put:
     *     summary: Marca un gasto como pagado
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del gasto interno
     *     responses:
     *       200:
     *         description: Gasto marcado como pagado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 expense:
     *                   $ref: '#/components/schemas/GastoInterno'
     *       400:
     *         description: Error al marcar como pagado - solo se pueden pagar gastos aprobados
     *       401:
     *         description: No autorizado
     *       403:
     *         description: No tiene permiso
     */
    .put('/:id/pay', auth, role(['admin']), InternalExpensesController.markExpenseAsPaid)

    /**
     * @swagger
     * /internal-expenses/{id}/status:
     *   put:
     *     summary: Actualiza el estado de un gasto
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del gasto interno
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - status
     *             properties:
     *               status:
     *                 type: string
     *                 enum: [pending, approved, rejected, paid]
     *                 description: Nuevo estado del gasto
     *               approved_by:
     *                 type: string
     *                 description: Usuario que realiza el cambio (requerido para approved/rejected)
     *           example:
     *             status: "approved"
     *             approved_by: "manager@company.com"
     *     responses:
     *       200:
     *         description: Estado actualizado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 expense:
     *                   $ref: '#/components/schemas/GastoInterno'
     *       400:
     *         description: Error al actualizar estado - transición no válida o estado requerido
     *       401:
     *         description: No autorizado
     *       403:
     *         description: No tiene permiso
     */
    .put('/:id/status', auth, role(['admin']), InternalExpensesController.updateExpenseStatus)

    // ==========================================
    // OPERACIONES DELETE (SOLO ADMIN)
    // ==========================================

    /**
     * @swagger
     * /internal-expenses/{id}:
     *   delete:
     *     summary: Elimina un gasto interno
     *     tags: [Gastos Internos]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del gasto interno
     *     responses:
     *       204:
     *         description: Gasto eliminado exitosamente
     *       400:
     *         description: Error al eliminar gasto - no encontrado o ya aprobado/pagado
     *       401:
     *         description: No autorizado
     *       403:
     *         description: No tiene permiso
     */
    .delete('/:id', auth, role(['admin']), InternalExpensesController.deleteExpense)

export default router;