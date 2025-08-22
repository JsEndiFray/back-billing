import express from 'express';
import InvoicesReceivedController from '../controllers/invoicesReceivedControllers.js';
import {handleUploadErrors, uploadInvoiceFile} from "../middlewares/fileUpload.js";
import errorHandler from "../middlewares/errorHandler.js";
import {validateCreateInvoiceReceived} from "../validator/validatorInvoicesReceived.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

/**
 * @swagger
 * tags:
 *   name: Facturas Recibidas
 *   description: API para gestión de facturas recibidas de proveedores
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FacturaRecibida:
 *       type: object
 *       required:
 *         - invoice_number
 *         - supplier_id
 *         - invoice_date
 *         - tax_base
 *         - description
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-generado de la factura
 *         invoice_number:
 *           type: string
 *           description: Número de factura del proveedor
 *         our_reference:
 *           type: string
 *           description: Nuestra referencia interna (auto-generada)
 *         supplier_id:
 *           type: integer
 *           description: ID del proveedor
 *         property_id:
 *           type: integer
 *           description: ID de la propiedad asociada (opcional)
 *         invoice_date:
 *           type: string
 *           format: date
 *           description: Fecha de la factura
 *         due_date:
 *           type: string
 *           format: date
 *           description: Fecha de vencimiento
 *         received_date:
 *           type: string
 *           format: date
 *           description: Fecha de recepción
 *         tax_base:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *           description: Base imponible
 *         iva_percentage:
 *           type: number
 *           format: float
 *           default: 21.00
 *           minimum: 0
 *           maximum: 100
 *           description: Porcentaje de IVA
 *         iva_amount:
 *           type: number
 *           format: float
 *           description: Importe del IVA (calculado automáticamente)
 *         irpf_percentage:
 *           type: number
 *           format: float
 *           default: 0.00
 *           minimum: 0
 *           maximum: 100
 *           description: Porcentaje de IRPF
 *         irpf_amount:
 *           type: number
 *           format: float
 *           description: Importe del IRPF (calculado automáticamente)
 *         total_amount:
 *           type: number
 *           format: float
 *           description: Importe total (calculado automáticamente)
 *         category:
 *           type: string
 *           enum: [electricidad, gas, agua, telefono, internet, mantenimiento, limpieza, seguridad, seguros, impuestos, servicios_profesionales, suministros, otros]
 *           default: otros
 *           description: Categoría del gasto
 *         subcategory:
 *           type: string
 *           description: Subcategoría del gasto
 *         description:
 *           type: string
 *           description: Descripción de la factura
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *         payment_status:
 *           type: string
 *           enum: [pending, paid, overdue, disputed]
 *           default: pending
 *           description: Estado de pago
 *         payment_method:
 *           type: string
 *           enum: [transfer, card, cash, check, financing]
 *           default: transfer
 *           description: Método de pago
 *         payment_date:
 *           type: string
 *           format: date
 *           description: Fecha de pago
 *         payment_reference:
 *           type: string
 *           description: Referencia del pago
 *         payment_notes:
 *           type: string
 *           description: Notas sobre el pago
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
 *         is_refund:
 *           type: boolean
 *           default: false
 *           description: Si es un abono
 *         original_invoice_id:
 *           type: integer
 *           description: ID de la factura original (para abonos)
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
 *         supplier_name:
 *           type: string
 *           readOnly: true
 *           description: Nombre del proveedor
 *         supplier_company:
 *           type: string
 *           readOnly: true
 *           description: Nombre de la empresa proveedora
 *         supplier_tax_id:
 *           type: string
 *           readOnly: true
 *           description: NIF/CIF del proveedor
 *         original_invoice_number:
 *           type: string
 *           readOnly: true
 *           description: Número de factura original (para abonos)
 *       example:
 *         id: 1
 *         invoice_number: "FAC-2024-001"
 *         our_reference: "FR-0001"
 *         supplier_id: 5
 *         invoice_date: "2024-07-30"
 *         due_date: "2024-08-30"
 *         tax_base: 1000.00
 *         iva_percentage: 21.00
 *         iva_amount: 210.00
 *         total_amount: 1210.00
 *         category: "electricidad"
 *         description: "Factura de electricidad julio 2024"
 *         payment_status: "pending"
 *         payment_method: "transfer"
 *
 *     EstadisticasFacturasRecibidas:
 *       type: object
 *       properties:
 *         total_invoices:
 *           type: integer
 *           description: Total de facturas recibidas
 *         pending_invoices:
 *           type: integer
 *           description: Facturas pendientes de pago
 *         paid_invoices:
 *           type: integer
 *           description: Facturas pagadas
 *         overdue_invoices:
 *           type: integer
 *           description: Facturas vencidas
 *         total_amount:
 *           type: number
 *           format: float
 *           description: Importe total
 *         total_iva:
 *           type: number
 *           format: float
 *           description: Total IVA soportado
 *         pending_amount:
 *           type: number
 *           format: float
 *           description: Importe pendiente de pago
 *         percentage_paid:
 *           type: integer
 *           description: Porcentaje de facturas pagadas
 *
 *     ActualizacionPago:
 *       type: object
 *       required:
 *         - payment_status
 *         - payment_method
 *       properties:
 *         payment_status:
 *           type: string
 *           enum: [pending, paid, overdue, disputed]
 *           description: Nuevo estado de pago
 *         payment_method:
 *           type: string
 *           enum: [transfer, card, cash, check, financing]
 *           description: Método de pago utilizado
 *         payment_date:
 *           type: string
 *           format: date
 *           description: Fecha del pago
 *         payment_reference:
 *           type: string
 *           description: Referencia del pago
 *         payment_notes:
 *           type: string
 *           description: Notas adicionales sobre el pago
 *       example:
 *         payment_status: "paid"
 *         payment_method: "transfer"
 *         payment_date: "2024-07-30"
 *         payment_reference: "TRF-12345"
 *         payment_notes: "Pago realizado mediante transferencia bancaria"
 *
 *     SimulacionProporcionalRecibida:
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
 *         iva_percentage:
 *           type: number
 *           format: float
 *           default: 21
 *           description: Porcentaje de IVA
 *         irpf_percentage:
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
 *         iva_percentage: 21
 *         irpf_percentage: 15
 *         start_date: "2024-07-17"
 *         end_date: "2024-07-31"
 */

const router = express.Router()

    // ==========================================
    // RUTAS DE CONSULTA (GET)
    // ==========================================

    /**
     * @swagger
     * /invoices-received:
     *   get:
     *     summary: Obtiene todas las facturas recibidas
     *     tags: [Facturas Recibidas]
     *     responses:
     *       200:
     *         description: Lista de todas las facturas recibidas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaRecibida'
     *       404:
     *         description: No se encontraron facturas recibidas
     */
    .get('/', auth, role(['admin', 'employee']), InvoicesReceivedController.getAllInvoicesReceived)

    /**
     * @swagger
     * /invoices-received/stats:
     *   get:
     *     summary: Obtiene estadísticas generales de facturas recibidas
     *     tags: [Facturas Recibidas]
     *     responses:
     *       200:
     *         description: Estadísticas de facturas recibidas
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/EstadisticasFacturasRecibidas'
     *       500:
     *         description: Error interno del servidor
     */
    .get('/stats', auth, role(['admin', 'employee']), InvoicesReceivedController.getInvoiceStats)

    /**
     * @swagger
     * /invoices-received/stats/category:
     *   get:
     *     summary: Obtiene estadísticas por categoría
     *     tags: [Facturas Recibidas]
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
     *                   invoice_count:
     *                     type: integer
     *                   total_amount:
     *                     type: number
     *                   total_iva:
     *                     type: number
     *       404:
     *         description: No hay estadísticas disponibles
     */
    .get('/stats/category', auth, role(['admin', 'employee']), InvoicesReceivedController.getStatsByCategory)

    /**
     * @swagger
     * /invoices-received/overdue:
     *   get:
     *     summary: Obtiene facturas vencidas
     *     tags: [Facturas Recibidas]
     *     responses:
     *       200:
     *         description: Lista de facturas vencidas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 allOf:
     *                   - $ref: '#/components/schemas/FacturaRecibida'
     *                   - type: object
     *                     properties:
     *                       days_overdue:
     *                         type: integer
     *                         description: Días de retraso
     *       404:
     *         description: No hay facturas vencidas
     */
    .get('/overdue', auth, role(['admin', 'employee']), InvoicesReceivedController.getOverdueInvoices)

    /**
     * @swagger
     * /invoices-received/due-soon:
     *   get:
     *     summary: Obtiene facturas próximas a vencer
     *     tags: [Facturas Recibidas]
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
     *                   - $ref: '#/components/schemas/FacturaRecibida'
     *                   - type: object
     *                     properties:
     *                       days_until_due:
     *                         type: integer
     *                         description: Días hasta el vencimiento
     *       404:
     *         description: No hay facturas próximas a vencer
     */
    .get('/due-soon', auth, role(['admin', 'employee']), InvoicesReceivedController.getInvoicesDueSoon)

    /**
     * @swagger
     * /invoices-received/refunds:
     *   get:
     *     summary: Obtiene todos los abonos
     *     tags: [Facturas Recibidas]
     *     responses:
     *       200:
     *         description: Lista de abonos
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaRecibida'
     *       404:
     *         description: No se encontraron abonos
     */
    .get('/refunds', auth, role(['admin', 'employee']), InvoicesReceivedController.getAllRefunds)

    /**
     * @swagger
     * /invoices-received/vat-book/{year}:
     *   get:
     *     summary: Obtiene datos para el libro de IVA soportado
     *     tags: [Facturas Recibidas]
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
     *                   invoice_date:
     *                     type: string
     *                     format: date
     *                   invoice_number:
     *                     type: string
     *                   supplier_name:
     *                     type: string
     *                   supplier_tax_id:
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
     *                   total_amount:
     *                     type: number
     *       400:
     *         description: Año requerido y debe ser válido
     *       404:
     *         description: No hay datos de IVA para el período especificado
     */
    .get('/vat-book/:year', auth, role(['admin', 'employee']), InvoicesReceivedController.getVATBookData)

    /**
     * @swagger
     * /invoices-received/search/{invoice_number}:
     *   get:
     *     summary: Busca facturas por número de factura del proveedor
     *     tags: [Facturas Recibidas]
     *     parameters:
     *       - in: path
     *         name: invoice_number
     *         required: true
     *         schema:
     *           type: string
     *         description: Número de factura del proveedor
     *         example: "FAC-2024-001"
     *     responses:
     *       200:
     *         description: Facturas encontradas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaRecibida'
     *       400:
     *         description: Número de factura requerido
     *       404:
     *         description: Factura no encontrada con ese número
     */
    .get('/search/:invoice_number', auth, role(['admin', 'employee']), InvoicesReceivedController.getInvoiceByNumber)

    /**
     * @swagger
     * /invoices-received/supplier/{supplier_id}:
     *   get:
     *     summary: Busca facturas por proveedor
     *     tags: [Facturas Recibidas]
     *     parameters:
     *       - in: path
     *         name: supplier_id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del proveedor
     *     responses:
     *       200:
     *         description: Facturas del proveedor encontradas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaRecibida'
     *       400:
     *         description: ID de proveedor inválido
     *       404:
     *         description: No se encontraron facturas para este proveedor
     */
    .get('/supplier/:supplier_id', auth, role(['admin', 'employee']), InvoicesReceivedController.getInvoicesBySupplierId)

    /**
     * @swagger
     * /invoices-received/category/{category}:
     *   get:
     *     summary: Busca facturas por categoría
     *     tags: [Facturas Recibidas]
     *     parameters:
     *       - in: path
     *         name: category
     *         required: true
     *         schema:
     *           type: string
     *           enum: [electricidad, gas, agua, telefono, internet, mantenimiento, limpieza, seguridad, seguros, impuestos, servicios_profesionales, suministros, otros]
     *         description: Categoría del gasto
     *     responses:
     *       200:
     *         description: Facturas encontradas por categoría
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaRecibida'
     *       400:
     *         description: Categoría requerida
     *       404:
     *         description: No se encontraron facturas para esta categoría
     */
    .get('/category/:category', auth, role(['admin', 'employee']), InvoicesReceivedController.getInvoicesByCategory)

    /**
     * @swagger
     * /invoices-received/payment-status/{status}:
     *   get:
     *     summary: Busca facturas por estado de pago
     *     tags: [Facturas Recibidas]
     *     parameters:
     *       - in: path
     *         name: status
     *         required: true
     *         schema:
     *           type: string
     *           enum: [pending, paid, overdue, disputed]
     *         description: Estado de pago
     *     responses:
     *       200:
     *         description: Facturas encontradas por estado de pago
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/FacturaRecibida'
     *       400:
     *         description: Estado de pago requerido
     *       404:
     *         description: No se encontraron facturas con ese estado de pago
     */
    .get('/payment-status/:status', auth, role(['admin', 'employee']), InvoicesReceivedController.getInvoicesByPaymentStatus)

    /**
     * @swagger
     * /invoices-received/{id}:
     *   get:
     *     summary: Obtiene una factura específica por ID
     *     tags: [Facturas Recibidas]
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
     *               $ref: '#/components/schemas/FacturaRecibida'
     *       400:
     *         description: ID inválido
     *       404:
     *         description: Factura no encontrada
     */
    .get('/:id', auth, role(['admin', 'employee']), InvoicesReceivedController.getInvoiceById)

    //=================================================
    //RUTA PARA VISUALIZAR EL PDF Y DESCARGAR EN VISUAL
    //=================================================

    /**
     * @swagger
     * /invoices-received/files/{fileName}:
     *   get:
     *     summary: Descarga un archivo adjunto de factura
     *     tags: [Facturas Recibidas]
     *     parameters:
     *       - in: path
     *         name: fileName
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre del archivo
     *     responses:
     *       200:
     *         description: Archivo PDF
     *         content:
     *           application/pdf:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: Archivo no encontrado
     */
    .get('/files/:fileName', auth, role(['admin', 'employee']), InvoicesReceivedController.downloadAttachment)

    // ==========================================
    // RUTAS DE MODIFICACIÓN (POST, PUT, DELETE)
    // ==========================================

    /**
     * @swagger
     * /invoices-received:
     *   post:
     *     summary: Crea una nueva factura recibida
     *     tags: [Facturas Recibidas]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/FacturaRecibida'
     *           example:
     *             invoice_number: "FAC-2024-001"
     *             supplier_id: 5
     *             invoice_date: "2024-07-30"
     *             tax_base: 1000.00
     *             iva_percentage: 21.00
     *             category: "electricidad"
     *             description: "Factura de electricidad julio 2024"
     *     responses:
     *       201:
     *         description: Factura recibida creada correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 invoice:
     *                   $ref: '#/components/schemas/FacturaRecibida'
     *       400:
     *         description: Error en los datos proporcionados, proveedor no existe o factura duplicada
     */
    .post('/', auth, role(['admin', 'employee']), uploadInvoiceFile, handleUploadErrors, validateCreateInvoiceReceived, errorHandler, InvoicesReceivedController.createInvoiceReceived)

    /**
     * @swagger
     * /invoices-received/date-range:
     *   post:
     *     summary: Busca facturas por rango de fechas
     *     tags: [Facturas Recibidas]
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
     *                 $ref: '#/components/schemas/FacturaRecibida'
     *       400:
     *         description: Fechas de inicio y fin son requeridas
     *       404:
     *         description: No se encontraron facturas en ese rango de fechas
     */
    .post('/date-range', auth, role(['admin', 'employee']), InvoicesReceivedController.getInvoicesByDateRange)

    /**
     * @swagger
     * /invoices-received/refunds:
     *   post:
     *     summary: Crea un abono basado en una factura original
     *     tags: [Facturas Recibidas]
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
     *                 description: ID de la factura original
     *               refundReason:
     *                 type: string
     *                 description: Motivo del abono
     *           example:
     *             originalInvoiceId: 123
     *             refundReason: "Error en facturación"
     *     responses:
     *       201:
     *         description: Abono creado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 refund:
     *                   $ref: '#/components/schemas/FacturaRecibida'
     *       400:
     *         description: ID de factura original requerido o error al crear abono
     */
    .post('/refunds', auth, role(['admin', 'employee']), InvoicesReceivedController.createRefund)

    /**
     * @swagger
     * /invoices-received/refunds/{id}/pdf:
     *   get:
     *     summary: Descarga el PDF de un abono específico
     *     tags: [Facturas Recibidas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del abono
     *     responses:
     *       200:
     *         description: PDF del abono generado correctamente
     *         content:
     *           application/pdf:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: Abono no encontrado
     *       400:
     *         description: La factura especificada no es un abono
     *       500:
     *         description: Error al generar PDF
     */
    .get('/refunds/:id/pdf', auth, role(['admin', 'employee']), InvoicesReceivedController.downloadRefundPdf)

    /**
     * @swagger
     * /invoices-received/{id}/pdf:
     *   get:
     *     summary: Descarga el PDF de una factura recibida específica
     *     tags: [Facturas Recibidas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de la factura
     *     responses:
     *       200:
     *         description: PDF generado correctamente
     *         content:
     *           application/pdf:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: Factura no encontrada
     */
    .get('/:id/pdf', auth, role(['admin', 'employee']), InvoicesReceivedController.downloadPdf)

    /**
     * @swagger
     * /invoices-received/{id}:
     *   put:
     *     summary: Actualiza una factura recibida existente
     *     tags: [Facturas Recibidas]
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
     *             $ref: '#/components/schemas/FacturaRecibida'
     *           example:
     *             tax_base: 1200.00
     *             iva_percentage: 21.00
     *             notes: "Actualización de importe"
     *     responses:
     *       200:
     *         description: Factura actualizada correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 invoice:
     *                   $ref: '#/components/schemas/FacturaRecibida'
     *       400:
     *         description: ID de factura inválido o error en los datos proporcionados
     *       404:
     *         description: Factura no encontrada
     */
    .put('/:id', auth, role(['admin', 'employee']), uploadInvoiceFile, handleUploadErrors, InvoicesReceivedController.updateInvoiceReceived)

    /**
     * @swagger
     * /invoices-received/{id}/payment:
     *   put:
     *     summary: Actualiza el estado de pago de una factura
     *     tags: [Facturas Recibidas]
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
     *             $ref: '#/components/schemas/ActualizacionPago'
     *     responses:
     *       200:
     *         description: Estado de pago actualizado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 invoice:
     *                   $ref: '#/components/schemas/FacturaRecibida'
     *       400:
     *         description: ID de factura inválido, estado y método de pago son requeridos, o estado/método inválido
     */
    .put('/:id/payment', auth, role(['admin', 'employee']), InvoicesReceivedController.updatePaymentStatus)

    /**
     * @swagger
     * /invoices-received/{id}:
     *   delete:
     *     summary: Elimina una factura recibida
     *     tags: [Facturas Recibidas]
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
     *         description: ID de factura inválido o error al eliminar factura
     *       404:
     *         description: Factura no encontrada
     */
    .delete('/:id', auth, role(['admin', 'employee']), InvoicesReceivedController.deleteInvoiceReceived)

export default router;

/**
 * EJEMPLOS DE USO:
 *
 * // Obtener todas las facturas recibidas
 * GET /api/invoices-received
 *
 * // Buscar por número de factura
 * GET /api/invoices-received/search/FAC-2024-001
 *
 * // Buscar por proveedor
 * GET /api/invoices-received/supplier/5
 *
 * // Buscar por categoría
 * GET /api/invoices-received/category/electricidad
 *
 * // Facturas vencidas
 * GET /api/invoices-received/overdue
 *
 * // Facturas próximas a vencer (7 días)
 * GET /api/invoices-received/due-soon?days=7
 *
 * // Crear nueva factura recibida
 * POST /api/invoices-received
 * Body: {
 *   "invoice_number": "FAC-2024-001",
 *   "supplier_id": 5,
 *   "invoice_date": "2024-07-19",
 *   "tax_base": 1000,
 *   "iva_percentage": 21,
 *   "category": "electricidad",
 *   "description": "Factura de electricidad julio 2024"
 * }
 *
 * // Actualizar factura
 * PUT /api/invoices-received/123
 * Body: {
 *   "tax_base": 1200,
 *   "iva_percentage": 21,
 *   "notes": "Actualización de importe"
 * }
 *
 * // Actualizar estado de pago
 * PUT /api/invoices-received/123/payment
 * Body: {
 *   "payment_status": "paid",
 *   "payment_method": "transfer",
 *   "payment_date": "2024-07-19",
 *   "payment_reference": "TRF-001"
 * }
 *
 * // Buscar por rango de fechas
 * POST /api/invoices-received/date-range
 * Body: {
 *   "startDate": "2024-01-01",
 *   "endDate": "2024-12-31"
 * }
 *
 * // Crear abono
 * POST /api/invoices-received/refunds
 * Body: {
 *   "originalInvoiceId": 123,
 *   "refundReason": "Error en facturación"
 * }
 *
 * // Estadísticas generales
 * GET /api/invoices-received/stats
 *
 * // Estadísticas por categoría
 * GET /api/invoices-received/stats/category
 *
 * // Libro de IVA soportado (año completo)
 * GET /api/invoices-received/vat-book/2024
 *
 * // Libro de IVA soportado (mes específico)
 * GET /api/invoices-received/vat-book/2024?month=7
 *
 * // Facturas por estado de pago
 * GET /api/invoices-received/payment-status/pending
 * GET /api/invoices-received/payment-status/paid
 * GET /api/invoices-received/payment-status/overdue
 * GET /api/invoices-received/payment-status/disputed
 *
 * ORDEN DE RUTAS IMPORTANTE:
 * Las rutas más específicas (como /stats, /overdue, /refunds) deben ir
 * ANTES que las rutas con parámetros (como /:id) para evitar conflictos.
 */