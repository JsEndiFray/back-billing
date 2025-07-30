import express from 'express';
import InvoicesIssuedController from '../controllers/invoicesIssuedControllers.js';
import {validateCreateInvoiceIssued} from "../validator/validatorInvoicesIssued.js";
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';

/**
 * @swagger
 * tags:
 *   name: Facturas Emitidas
 *   description: API para gestión de facturas emitidas y abonos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FacturaEmitida:
 *       type: object
 *       required:
 *         - estates_id
 *         - clients_id
 *         - owners_id
 *         - invoice_date
 *         - tax_base
 *         - iva
 *         - irpf
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-generado de la factura
 *         invoice_number:
 *           type: string
 *           description: Número de factura (auto-generado)
 *         estates_id:
 *           type: integer
 *           description: ID de la propiedad
 *         clients_id:
 *           type: integer
 *           description: ID del cliente
 *         owners_id:
 *           type: integer
 *           description: ID del propietario
 *         ownership_percent:
 *           type: number
 *           format: float
 *           description: Porcentaje de propiedad
 *         invoice_date:
 *           type: string
 *           format: date
 *           description: Fecha de emisión de la factura
 *         due_date:
 *           type: string
 *           format: date
 *           description: Fecha de vencimiento
 *         tax_base:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *           description: Base imponible
 *         iva:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 100
 *           description: Porcentaje de IVA
 *         irpf:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 100
 *           description: Porcentaje de IRPF
 *         total:
 *           type: number
 *           format: float
 *           description: Total de la factura (calculado automáticamente)
 *         is_refund:
 *           type: boolean
 *           default: false
 *           description: Si es un abono (factura rectificativa)
 *         original_invoice_id:
 *           type: integer
 *           description: ID de la factura original (para abonos)
 *         collection_status:
 *           type: string
 *           enum: [pending, collected, overdue]
 *           default: pending
 *           description: Estado de cobro de la factura
 *         collection_method:
 *           type: string
 *           enum: [transfer, card, cash, check]
 *           default: transfer
 *           description: Método de cobro
 *         collection_date:
 *           type: string
 *           format: date
 *           description: Fecha de cobro
 *         collection_reference:
 *           type: string
 *           description: Referencia del cobro
 *         collection_notes:
 *           type: string
 *           description: Notas sobre el cobro
 *         start_date:
 *           type: string
 *           format: date
 *           description: Fecha de inicio del período (facturación proporcional)
 *         end_date:
 *           type: string
 *           format: date
 *           description: Fecha de fin del período (facturación proporcional)
 *         corresponding_month:
 *           type: string
 *           pattern: '^\d{4}-\d{2}$'
 *           description: Mes de correspondencia (formato YYYY-MM)
 *         is_proportional:
 *           type: boolean
 *           default: false
 *           description: Si es facturación proporcional
 *         pdf_path:
 *           type: string
 *           description: Ruta del archivo PDF
 *         has_attachments:
 *           type: boolean
 *           default: false
 *           description: Si tiene archivos adjuntos
 *         created_by:
 *           type: string
 *           description: Usuario que creó la factura
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         # Campos de relaciones (solo lectura)
 *         estate_name:
 *           type: string
 *           readOnly: true
 *           description: Dirección de la propiedad
 *         owner_name:
 *           type: string
 *           readOnly: true
 *           description: Nombre del propietario
 *         client_name:
 *           type: string
 *           readOnly: true
 *           description: Nombre del cliente
 *         original_invoice_number:
 *           type: string
 *           readOnly: true
 *           description: Número de factura original (para abonos)
 *       example:
 *         id: 1
 *         invoice_number: "FACT-0001"
 *         estates_id: 5
 *         clients_id: 3
 *         owners_id: 2
 *         ownership_percent: 100.00
 *         invoice_date: "2024-07-30"
 *         due_date: "2024-08-30"
 *         tax_base: 1000.00
 *         iva: 21.00
 *         irpf: 15.00
 *         total: 1060.00
 *         collection_status: "pending"
 *         collection_method: "transfer"
 *         corresponding_month: "2024-07"
 *         is_proportional: false
 *
 *     EstadisticasFacturasEmitidas:
 *       type: object
 *       properties:
 *         total_invoices:
 *           type: integer
 *           description: Total de facturas emitidas
 *         pending_invoices:
 *           type: integer
 *           description: Facturas pendientes de cobro
 *         collected_invoices:
 *           type: integer
 *           description: Facturas cobradas
 *         overdue_invoices:
 *           type: integer
 *           description: Facturas vencidas
 *         total_amount:
 *           type: number
 *           format: float
 *           description: Importe total facturado
 *         total_iva_repercutido:
 *           type: number
 *           format: float
 *           description: Total IVA repercutido
 *         total_irpf_retenido:
 *           type: number
 *           format: float
 *           description: Total IRPF retenido
 *         pending_amount:
 *           type: number
 *           format: float
 *           description: Importe pendiente de cobro
 *
 *     ActualizacionCobro:
 *       type: object
 *       required:
 *         - collection_status
 *         - collection_method
 *       properties:
 *         collection_status:
 *           type: string
 *           enum: [pending, collected, overdue]
 *           description: Nuevo estado de cobro
 *         collection_method:
 *           type: string
 *           enum: [transfer, card, cash, check]
 *           description: Método de cobro utilizado
 *         collection_date:
 *           type: string
 *           format: date
 *           description: Fecha del cobro
 *         collection_reference:
 *           type: string
 *           description: Referencia del cobro
 *         collection_notes:
 *           type: string
 *           description: Notas adicionales sobre el cobro
 *       example:
 *         collection_status: "collected"
 *         collection_method: "card"
 *         collection_date: "2024-07-30"
 *         collection_reference: "REF-12345"
 *         collection_notes: "Cobrado con tarjeta Visa"
 *
 *     SimulacionProporcional:
 *       type: object
 *       required:
 *         - tax_base
 *         - start_date
 *         - end_date
 *       properties:
 *         tax_base:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *           description: Base imponible
 *         iva:
 *           type: number
 *           format: float
 *           default: 0
 *           description: Porcentaje de IVA
 *         irpf:
 *           type: number
 *           format: float
 *           default: 0
 *           description: Porcentaje de IRPF
 *         start_date:
 *           type: string
 *           format: date
 *           description: Fecha de inicio del período
 *         end_date:
 *           type: string
 *           format: date
 *           description: Fecha de fin del período
 *       example:
 *         tax_base: 1000
 *         iva: 21
 *         irpf: 15
 *         start_date: "2024-07-17"
 *         end_date: "2024-07-31"
 */

const router = express.Router()

    // ==========================================
    // RUTAS DE CONSULTA (GET) - ORDENADAS POR ESPECIFICIDAD
    // ==========================================

    // Rutas de estadísticas y reportes (más generales/agregadas)

    /**
     * @swagger
     * /invoices-issued/stats:
     *   get:
     *     summary: Obtiene estadísticas generales de facturas emitidas
     *     tags: [Facturas Emitidas]
     *     responses:
     *       200:
     *         description: Estadísticas de facturas emitidas
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/EstadisticasFacturasEmitidas'
     *       500:
     *         description: Error interno del servidor
     */
    .get('/stats', auth, role(['admin', 'employee']), InvoicesIssuedController.getInvoiceStats)

    /**
     * @swagger
     * /invoices-issued/stats/client:
     *   get:
     *     summary: Obtiene estadísticas por cliente
     *     tags: [Facturas Emitidas]
     *     responses:
     *       200:
     *         description: Estadísticas por cliente
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   client_name:
     *                     type: string
     *                   client_nif:
     *                     type: string
     *                   invoice_count:
     *                     type: integer
     *                   total_amount:
     *                     type: number
     *                   total_iva:
     *                     type: number
     *                   total_irpf:
     *                     type: number
     *       404:
     *         description: No hay estadísticas disponibles
     */
    .get('/stats/client', auth, role(['admin', 'employee']), InvoicesIssuedController.getStatsByClient)

    /**
     * @swagger
     * /invoices-issued/stats/owner:
     *   get:
     *     summary: Obtiene estadísticas por propietario
     *     tags: [Facturas Emitidas]
     *     responses:
     *       200:
     *         description: Estadísticas por propietario
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   owner_name:
     *                     type: string
     *                   owner_nif:
     *                     type: string
     *                   invoice_count:
     *                     type: integer
     *                   total_amount:
     *                     type: number
     *                   avg_amount:
     *                     type: number
     *       404:
     *         description: No hay estadísticas disponibles
     */
    .get('/stats/owner', auth, role(['admin', 'employee']), InvoicesIssuedController.getStatsByOwner)

    /**
     * @swagger
     * /invoices-issued/overdue:
     *   get:
     *     summary: Obtiene facturas vencidas
     *     tags: [Facturas Emitidas]
     *     responses:
     *       200:
     *         description: Lista de facturas vencidas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 allOf:
     *                   - $ref: '#/components/schemas/FacturaEmitida'
     *                   - type: object
     *                     properties:
     *                       days_overdue:
     *                         type: integer
     *                         description: Días de retraso
     *       404:
     *         description: No hay facturas vencidas
     */
    .get('/overdue', auth, role(['admin', 'employee']), InvoicesIssuedController.getOverdueInvoices)

    /**
     * @swagger
     * /invoices-issued/due-soon:
     *   get:
     *     summary: Obtiene facturas próximas a vencer
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: query
     *         name: days
     *         schema:
     *           type: integer
     *           default: 7
     *           minimum: 1
     *           maximum: 90
     *         description: Días de antelación para considerar próximo vencimiento
     *     responses:
     *       200:
     *         description: Lista de facturas próximas a vencer
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 allOf:
     *                   - $ref: '#/components/schemas/FacturaEmitida'
     *                   - type: object
     *                     properties:
     *                       days_until_due:
     *                         type: integer
     *                         description: Días hasta el vencimiento
     *       404:
     *         description: No hay facturas próximas a vencer
     */
    .get('/due-soon', auth, role(['admin', 'employee']), InvoicesIssuedController.getInvoicesDueSoon)

    /**
     * @swagger
     * /invoices-issued/aging:
     *   get:
     *     summary: Obtiene facturas pendientes con aging (antigüedad)
     *     tags: [Facturas Emitidas]
     *     responses:
     *       200:
     *         description: Facturas pendientes con información de antigüedad
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 allOf:
     *                   - $ref: '#/components/schemas/FacturaEmitida'
     *                   - type: object
     *                     properties:
     *                       days_overdue:
     *                         type: integer
     *                         description: Días de retraso
     *                       aging_bucket:
     *                         type: string
     *                         enum: [CURRENT, 1-30_DAYS, 31-60_DAYS, 61-90_DAYS, OVER_90_DAYS]
     *                         description: Categoría de antigüedad
     *       404:
     *         description: No hay facturas pendientes
     */
    .get('/aging', auth, role(['admin', 'employee']), InvoicesIssuedController.getPendingInvoicesAging)

    /**
     * @swagger
     * /invoices-issued/refunds:
     *   get:
     *     summary: Obtiene todos los abonos (facturas rectificativas)
     *     tags: [Facturas Emitidas]
     *     responses:
     *       200:
     *         description: Lista de abonos
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaEmitida'
     *       404:
     *         description: No se encontraron abonos
     */
    .get('/refunds', auth, role(['admin', 'employee']), InvoicesIssuedController.getAllRefunds)

    /**
     * @swagger
     * /invoices-issued/vat-book/{year}:
     *   get:
     *     summary: Obtiene datos para el libro de IVA repercutido
     *     tags: [Facturas Emitidas]
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
     *         description: Datos del libro de IVA repercutido
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   invoice_date:
     *                     type: string
     *                     format: date
     *                   invoice_number:
     *                     type: string
     *                   client_name:
     *                     type: string
     *                   client_nif:
     *                     type: string
     *                   tax_base:
     *                     type: number
     *                   iva_percentage:
     *                     type: number
     *                   iva_amount:
     *                     type: number
     *                   irpf_percentage:
     *                     type: number
     *                   irpf_amount:
     *                     type: number
     *                   total:
     *                     type: number
     *       400:
     *         description: Año requerido y debe ser válido
     *       404:
     *         description: No hay datos de IVA para el período especificado
     */
    .get('/vat-book/:year', auth, role(['admin', 'employee']), InvoicesIssuedController.getVATBookData)

    /**
     * @swagger
     * /invoices-issued/income-statement/{year}:
     *   get:
     *     summary: Obtiene balance de ingresos
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: year
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 2020
     *           maximum: 2030
     *         description: Año para el balance
     *       - in: query
     *         name: month
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 12
     *         description: Mes específico (opcional)
     *     responses:
     *       200:
     *         description: Balance de ingresos del período
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   type:
     *                     type: string
     *                     example: "INGRESOS"
     *                   total_amount:
     *                     type: number
     *                   refunds_amount:
     *                     type: number
     *                   net_amount:
     *                     type: number
     *       400:
     *         description: Año requerido y debe ser válido
     *       404:
     *         description: No hay datos de ingresos para el período especificado
     */
    .get('/income-statement/:year', auth, role(['admin', 'employee']), InvoicesIssuedController.getIncomeStatement)

    /**
     * @swagger
     * /invoices-issued/monthly-summary/{year}:
     *   get:
     *     summary: Obtiene resumen mensual de facturación
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: year
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 2020
     *           maximum: 2030
     *         description: Año para el resumen mensual
     *     responses:
     *       200:
     *         description: Resumen mensual de facturación del año
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
     *                   invoice_count:
     *                     type: integer
     *                   total_invoiced:
     *                     type: number
     *                   total_refunded:
     *                     type: number
     *                   net_amount:
     *                     type: number
     *       400:
     *         description: Año requerido y debe ser válido
     *       404:
     *         description: No hay datos de facturación para el año especificado
     */
    .get('/monthly-summary/:year', auth, role(['admin', 'employee']), InvoicesIssuedController.getMonthlySummary)

    // Rutas de búsqueda específicas (deben ir antes de /:id)

    /**
     * @swagger
     * /invoices-issued/search/{invoice_number}:
     *   get:
     *     summary: Busca una factura por su número
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: invoice_number
     *         required: true
     *         schema:
     *           type: string
     *         description: Número de la factura
     *         example: "FACT-0001"
     *     responses:
     *       200:
     *         description: Factura encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FacturaEmitida'
     *       400:
     *         description: Número de factura requerido
     *       404:
     *         description: Factura no encontrada
     */
    .get('/search/:invoice_number', auth, role(['admin', 'employee']), InvoicesIssuedController.getInvoiceByNumber)

    /**
     * @swagger
     * /invoices-issued/owners/{id}:
     *   get:
     *     summary: Obtiene todas las facturas de un propietario específico
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del propietario
     *     responses:
     *       200:
     *         description: Facturas del propietario encontradas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaEmitida'
     *       400:
     *         description: ID inválido
     *       404:
     *         description: Facturas no encontradas
     */
    .get('/owners/:id', auth, role(['admin', 'employee']), InvoicesIssuedController.getInvoicesByOwnerId)

    /**
     * @swagger
     * /invoices-issued/clients/{id}:
     *   get:
     *     summary: Obtiene todas las facturas de un cliente específico por ID
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del cliente
     *     responses:
     *       200:
     *         description: Facturas del cliente encontradas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaEmitida'
     *       400:
     *         description: ID inválido
     *       404:
     *         description: Facturas no encontradas
     */
    .get('/clients/:id', auth, role(['admin', 'employee']), InvoicesIssuedController.getInvoicesByClientId)

    /**
     * @swagger
     * /invoices-issued/clients/nif/{nif}:
     *   get:
     *     summary: Obtiene el historial de facturas de un cliente por su NIF
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: nif
     *         required: true
     *         schema:
     *           type: string
     *         description: NIF/CIF del cliente
     *         example: "12345678Z"
     *     responses:
     *       200:
     *         description: Historial de facturas del cliente
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaEmitida'
     *       400:
     *         description: NIF inválido
     *       404:
     *         description: Facturas no encontradas
     */
    .get('/clients/nif/:nif', auth, role(['admin', 'employee']), InvoicesIssuedController.getInvoicesByClientNif)

    /**
     * @swagger
     * /invoices-issued/collection-status/{status}:
     *   get:
     *     summary: Busca facturas por estado de cobro
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: status
     *         required: true
     *         schema:
     *           type: string
     *           enum: [pending, collected, overdue]
     *         description: Estado de cobro
     *     responses:
     *       200:
     *         description: Facturas encontradas por estado de cobro
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaEmitida'
     *       400:
     *         description: Estado de cobro requerido
     *       404:
     *         description: No se encontraron facturas con ese estado de cobro
     */
    .get('/collection-status/:status', auth, role(['admin', 'employee']), InvoicesIssuedController.getInvoicesByCollectionStatus)

    /**
     * @swagger
     * /invoices-issued/month/{month}:
     *   get:
     *     summary: Busca facturas por mes de correspondencia
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: month
     *         required: true
     *         schema:
     *           type: string
     *           pattern: '^\d{4}-\d{2}$'
     *         description: Mes de correspondencia (formato YYYY-MM)
     *         example: "2024-07"
     *     responses:
     *       200:
     *         description: Facturas encontradas para el mes especificado
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaEmitida'
     *       400:
     *         description: Formato de mes inválido. Use YYYY-MM
     *       404:
     *         description: No se encontraron facturas para ese mes
     */
    .get('/month/:month', auth, role(['admin', 'employee']), InvoicesIssuedController.getInvoicesByCorrespondingMonth)

    /**
     * @swagger
     * /invoices-issued/{id}/proportional-details:
     *   get:
     *     summary: Obtiene detalles del cálculo proporcional de una factura
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de la factura
     *     responses:
     *       200:
     *         description: Detalles del cálculo proporcional
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 proportional_calculation:
     *                   type: object
     *                   description: Detalles del cálculo proporcional
     *                 period_description:
     *                   type: string
     *                   description: Descripción del período
     *       400:
     *         description: ID de factura inválido
     *       404:
     *         description: Factura no encontrada
     */
    .get('/:id/proportional-details', auth, role(['admin', 'employee']), InvoicesIssuedController.getProportionalCalculationDetails)

    /**
     * @swagger
     * /invoices-issued/{id}/pdf:
     *   get:
     *     summary: Genera y descarga un PDF de una factura específica
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de la factura
     *     responses:
     *       200:
     *         description: Archivo PDF para descarga
     *         content:
     *           application/pdf:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: Factura no encontrada
     *       500:
     *         description: Error al generar PDF
     */
    .get('/:id/pdf', auth, role(['admin', 'employee']), InvoicesIssuedController.downloadPdf)

    /**
     * @swagger
     * /invoices-issued/refunds/{id}/pdf:
     *   get:
     *     summary: Genera y descarga un PDF de un abono específico
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del abono
     *     responses:
     *       200:
     *         description: Archivo PDF de abono para descarga
     *         content:
     *           application/pdf:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: Abono no encontrado
     *       500:
     *         description: Error al generar PDF
     */
    .get('/refunds/:id/pdf', auth, role(['admin', 'employee']), InvoicesIssuedController.downloadRefundPdf)
    // Ruta para obtener todas las facturas (general)

    /**
     * @swagger
     * /invoices-issued:
     *   get:
     *     summary: Obtiene todas las facturas emitidas
     *     tags: [Facturas Emitidas]
     *     responses:
     *       200:
     *         description: Lista de todas las facturas emitidas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaEmitida'
     *       404:
     *         description: No se encontraron facturas emitidas
     */
    .get('/', auth, role(['admin', 'employee']), InvoicesIssuedController.getAllInvoicesIssued)

    // Ruta para obtener una factura específica por ID (LA MÁS GENÉRICA CON PARÁMETRO)

    /**
     * @swagger
     * /invoices-issued/{id}:
     *   get:
     *     summary: Obtiene una factura específica por ID
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de la factura
     *     responses:
     *       200:
     *         description: Factura encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FacturaEmitida'
     *       400:
     *         description: ID inválido
     *       404:
     *         description: Factura no encontrada
     */
    .get('/:id', auth, role(['admin', 'employee']), InvoicesIssuedController.getInvoiceById)

    // ==========================================
    // RUTAS DE MODIFICACIÓN (POST, PUT, DELETE) - El orden entre estas suele ser menos crítico
    // ==========================================

    /**
     * @swagger
     * /invoices-issued:
     *   post:
     *     summary: Crea una nueva factura emitida
     *     tags: [Facturas Emitidas]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/FacturaEmitida'
     *           example:
     *             estates_id: 5
     *             clients_id: 3
     *             owners_id: 2
     *             ownership_percent: 100.00
     *             invoice_date: "2024-07-30"
     *             due_date: "2024-08-30"
     *             tax_base: 1000.00
     *             iva: 21.00
     *             irpf: 15.00
     *             corresponding_month: "2024-07"
     *     responses:
     *       201:
     *         description: Factura creada exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 invoice:
     *                   $ref: '#/components/schemas/FacturaEmitida'
     *       400:
     *         description: Datos de factura inválidos o faltantes, o error en campos proporcionales
     *       409:
     *         description: Ya existe una factura para este cliente en esa propiedad y mes
     */
    .post('/', auth, role(['admin']), validateCreateInvoiceIssued, InvoicesIssuedController.createInvoice)

    /**
     * @swagger
     * /invoices-issued/date-range:
     *   post:
     *     summary: Busca facturas por rango de fechas
     *     tags: [Facturas Emitidas]
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
     *         description: Facturas encontradas en el rango de fechas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaEmitida'
     *       400:
     *         description: Fechas de inicio y fin son requeridas
     *       404:
     *         description: No se encontraron facturas en ese rango de fechas
     */
    .post('/date-range', auth, role(['admin']), InvoicesIssuedController.getInvoicesByDateRange)

    /**
     * @swagger
     * /invoices-issued/refunds:
     *   post:
     *     summary: Crea un abono (factura rectificativa) a partir de una factura existente
     *     tags: [Facturas Emitidas]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - originalInvoiceId
     *             properties:
     *               originalInvoiceId:
     *                 type: integer
     *                 description: ID de la factura original a abonar
     *           example:
     *             originalInvoiceId: 123
     *     responses:
     *       201:
     *         description: Abono creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 refund:
     *                   $ref: '#/components/schemas/FacturaEmitida'
     *       400:
     *         description: ID de factura original requerido o no se puede crear un abono a partir de otro abono
     *       404:
     *         description: Factura original no encontrada
     */
    .post('/refunds', auth, role(['admin']), InvoicesIssuedController.createRefund)

    /**
     * @swagger
     * /invoices-issued/validate-proportional-dates:
     *   post:
     *     summary: Valida un rango de fechas para facturación proporcional
     *     tags: [Facturas Emitidas]
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
     *             start_date: "2024-07-17"
     *             end_date: "2024-07-31"
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
     *                 periodDescription:
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
    .post('/validate-proportional-dates', auth, role(['admin']), InvoicesIssuedController.validateProportionalDateRange)

    /**
     * @swagger
     * /invoices-issued/simulate-proportional:
     *   post:
     *     summary: Calcula una simulación de factura proporcional sin guardarla
     *     tags: [Facturas Emitidas]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SimulacionProporcional'
     *     responses:
     *       200:
     *         description: Simulación de cálculo proporcional exitosa
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 tax_base:
     *                   type: number
     *                   format: float
     *                 iva:
     *                   type: number
     *                   format: float
     *                 irpf:
     *                   type: number
     *                   format: float
     *                 total:
     *                   type: number
     *                   format: float
     *                 periodDescription:
     *                   type: string
     *                 simulation:
     *                   type: boolean
     *                   example: true
     *       400:
     *         description: Base imponible debe ser mayor a 0 o fechas de inicio y fin son requeridas
     */
    .post('/simulate-proportional', auth, role(['admin']), InvoicesIssuedController.simulateProportionalBilling)

    /**
     * @swagger
     * /invoices-issued/{id}:
     *   put:
     *     summary: Actualiza una factura existente
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de la factura
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/FacturaEmitida'
     *           example:
     *             tax_base: 1200.00
     *             iva: 21.00
     *             irpf: 15.00
     *     responses:
     *       200:
     *         description: Factura actualizada exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 invoice:
     *                   $ref: '#/components/schemas/FacturaEmitida'
     *       400:
     *         description: ID inválido o error de validación
     *       404:
     *         description: Factura no encontrada
     *       409:
     *         description: El número de factura ya existe
     */
    .put('/:id', auth, role(['admin']), InvoicesIssuedController.updateInvoice)

    /**
     * @swagger
     * /invoices-issued/{id}/collection:
     *   put:
     *     summary: Actualiza el estado y método de cobro de una factura
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de la factura
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ActualizacionCobro'
     *     responses:
     *       200:
     *         description: Estado de cobro actualizado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 invoice:
     *                   $ref: '#/components/schemas/FacturaEmitida'
     *       400:
     *         description: ID de factura inválido, estado y método de cobro son requeridos, o estado/método inválido
     */
    .put('/:id/collection', auth, role(['admin']), InvoicesIssuedController.updateCollectionStatus)

    /**
     * @swagger
     * /invoices-issued/{id}:
     *   delete:
     *     summary: Elimina una factura del sistema
     *     tags: [Facturas Emitidas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de la factura
     *     responses:
     *       204:
     *         description: Factura eliminada exitosamente
     *       400:
     *         description: ID inválido o error al eliminar factura
     *       404:
     *         description: Factura no encontrada
     */
    .delete('/:id', auth, role(['admin']), InvoicesIssuedController.deleteInvoice)

export default router;

/*
// ==========================================
// EJEMPLOS DE USO: (Estos comentarios se mantienen)
// ==========================================
 * // Obtener todas las facturas emitidas
 * GET /api/invoices-issued
 * ... (rest of examples)
 *
 * ORDEN DE RUTAS IMPORTANTE:
 * Las rutas más específicas (como /stats, /overdue, /refunds) deben ir
 * ANTES que las rutas con parámetros (como /:id) para evitar conflictos.
 *
 * DIFERENCIAS CON BILLS:
 * - invoice_number en lugar de bill_number
 * - collection_status en lugar de payment_status
 * - Nuevos endpoints específicos para ingresos
 * - Endpoints de aging y reportes avanzados
 * - Facturación proporcional integrada
 */