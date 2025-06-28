import express from "express";
import BillsControllers from "../controllers/billsControllers.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

/**
 * @swagger
 * tags:
 *   name: Facturas
 *   description: API para gestión de facturas y abonos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Factura:
 *       type: object
 *       required:
 *         - client_id
 *         - estate_id
 *         - bill_date
 *         - amount
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-generado de la factura
 *         bill_number:
 *           type: string
 *           description: Número de factura único
 *         client_id:
 *           type: string
 *           description: ID del cliente
 *         estate_id:
 *           type: string
 *           description: ID del inmueble
 *         bill_date:
 *           type: string
 *           format: date
 *           description: Fecha de emisión
 *         amount:
 *           type: number
 *           description: Importe total
 *         paid:
 *           type: boolean
 *           description: Estado de pago
 *         payment_date:
 *           type: string
 *           format: date
 *           description: Fecha de pago
 *         payment_method:
 *           type: string
 *           enum: [efectivo, transferencia, domiciliación]
 *           description: Método de pago
 *         concept:
 *           type: string
 *           description: Concepto de la factura
 *         is_refund:
 *           type: boolean
 *           default: false
 *           description: Si es un abono (true) o factura normal (false)
 *         original_bill_id:
 *           type: string
 *           description: ID de la factura original (solo para abonos)
 *       example:
 *         id: "1"
 *         bill_number: "F-2025-001"
 *         client_id: "5"
 *         estate_id: "10"
 *         bill_date: "2025-01-15"
 *         amount: 800
 *         paid: true
 *         payment_date: "2025-01-20"
 *         payment_method: "transferencia"
 *         concept: "Alquiler enero 2025"
 *         is_refund: false
 *
 *     Abono:
 *       type: object
 *       required:
 *         - original_bill_id
 *         - bill_date
 *         - amount
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-generado del abono
 *         bill_number:
 *           type: string
 *           description: Número de abono único
 *         original_bill_id:
 *           type: string
 *           description: ID de la factura original
 *         bill_date:
 *           type: string
 *           format: date
 *           description: Fecha de emisión
 *         amount:
 *           type: number
 *           description: Importe del abono
 *         concept:
 *           type: string
 *           description: Concepto del abono
 *         is_refund:
 *           type: boolean
 *           default: true
 *           description: Siempre true para abonos
 *       example:
 *         id: "2"
 *         bill_number: "A-2025-001"
 *         original_bill_id: "1"
 *         bill_date: "2025-01-25"
 *         amount: 800
 *         concept: "Abono por cancelación de contrato"
 *         is_refund: true
 */

const router = express.Router()

    // === RUTAS PARA ABONOS (REFUNDS) ===
    /**
     * @swagger
     * /bills/refunds:
     *   get:
     *     summary: Obtiene todos los abonos
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de todos los abonos
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Abono'
     *       403:
     *         description: No tiene permiso
     */
    .get('/refunds', auth, role(['admin', 'employee']), BillsControllers.getAllRefunds)

    /**
     * @swagger
     * /bills/refunds:
     *   post:
     *     summary: Crea un nuevo abono
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Abono'
     *     responses:
     *       201:
     *         description: Abono creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Abono'
     *       400:
     *         description: Datos inválidos
     *       403:
     *         description: No tiene permiso
     *       404:
     *         description: Factura original no encontrada
     */
    .post('/refunds', auth, role(['admin']), BillsControllers.createRefund)

    /**
     * @swagger
     * /bills/refunds/{id}/pdf:
     *   get:
     *     summary: Descarga PDF de un abono
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID del abono
     *     responses:
     *       200:
     *         description: PDF del abono
     *         content:
     *           application/pdf:
     *             schema:
     *               type: string
     *               format: binary
     *       403:
     *         description: No tiene permiso
     *       404:
     *         description: Abono no encontrado
     */
    .get('/refunds/:id/pdf', auth, role(['admin', 'employee']), BillsControllers.downloadRefundPdf)


    //RUTAS PARA BÚSQUEDAS (FACTURAS NORMALES)
    /**
     * @swagger
     * /bills/search/{bill_number}:
     *   get:
     *     summary: Busca factura por número
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: bill_number
     *         schema:
     *           type: string
     *         required: true
     *         description: Número de factura a buscar
     *     responses:
     *       200:
     *         description: Factura encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Factura'
     *       404:
     *         description: Factura no encontrada
     */
    .get('/search/:bill_number', auth, role(['admin', 'employee']), BillsControllers.getBillNumber)

    /**
     * @swagger
     * /bills/owners/{id}:
     *   get:
     *     summary: Obtiene facturas por ID de propietario
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID del propietario
     *     responses:
     *       200:
     *         description: Lista de facturas del propietario
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Factura'
     */
    .get('/owners/:id', auth, role(['admin', 'employee']), BillsControllers.getOwnersId)

    /**
     * @swagger
     * /bills/clients/nif/{nif}:
     *   get:
     *     summary: Obtiene facturas por NIF del cliente
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: nif
     *         schema:
     *           type: string
     *         required: true
     *         description: NIF del cliente
     *     responses:
     *       200:
     *         description: Lista de facturas del cliente por NIF
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Factura'
     */
    .get('/clients/nif/:nif', auth, role(['admin', 'employee']), BillsControllers.getBillsByClientNif)

    /**
     * @swagger
     * /bills/clients/{id}:
     *   get:
     *     summary: Obtiene facturas por ID de cliente
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID del cliente
     *     responses:
     *       200:
     *         description: Lista de facturas del cliente
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Factura'
     */
    .get('/clients/:id', auth, role(['admin', 'employee']), BillsControllers.getByClientsId)

    /**
     * @swagger
     * /bills:
     *   get:
     *     summary: Obtiene todas las facturas
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de todas las facturas
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Factura'
     */
    .get('/', auth, role(['admin', 'employee']), BillsControllers.getAllBills)

    //RUTAS PARA GESTIÓN DE FACTURAS NORMALES

    /**
     * @swagger
     * /bills/{id}/pdf:
     *   get:
     *     summary: Descarga PDF de una factura
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la factura
     *     responses:
     *       200:
     *         description: PDF de la factura
     *         content:
     *           application/pdf:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: Factura no encontrada
     */
    .get('/:id/pdf', auth, role(['admin', 'employee']), BillsControllers.downloadPdf)

    /**
     * @swagger
     * /bills/{id}:
     *   get:
     *     summary: Obtiene una factura por ID
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la factura
     *     responses:
     *       200:
     *         description: Factura encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Factura'
     *       404:
     *         description: Factura no encontrada
     */
    .get('/:id', auth, role(['admin', 'employee']), BillsControllers.getBillById)

    //RUTAS PARA CREAR/ACTUALIZAR/ELIMINAR FACTURAS

    /**
     * @swagger
     * /bills/{id}/payment:
     *   put:
     *     summary: Actualiza el estado de pago de una factura
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la factura
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - payment_status
     *               - payment_method
     *             properties:
     *               payment_status:
     *                 type: string
     *                 enum: [pending, paid]
     *                 description: Estado del pago
     *               payment_method:
     *                 type: string
     *                 enum: [direct_debit, cash, card, transfer]
     *                 description: Método de pago
     *               payment_date:
     *                 type: string
     *                 format: date
     *                 description: Fecha de pago
     *               payment_notes:
     *                 type: string
     *                 description: Notas del pago
     *           example:
     *             payment_status: "paid"
     *             payment_method: "card"
     *             payment_date: "2025-06-28"
     *             payment_notes: "Pagado con tarjeta Visa"
     *     responses:
     *       200:
     *         description: Estado de pago actualizado correctamente
     *       400:
     *         description: Datos inválidos
     *       403:
     *         description: No tiene permiso
     *       404:
     *         description: Factura no encontrada
     */
    .put('/:id/payment', auth, role(['admin', 'employee']), BillsControllers.updatePaymentStatus)

    /**
     * @swagger
     * /bills:
     *   post:
     *     summary: Crea una nueva factura
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Factura'
     *     responses:
     *       201:
     *         description: Factura creada exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Factura'
     *       400:
     *         description: Datos inválidos
     */
    .post('/', auth, role(['admin', 'employee']), BillsControllers.createBill)

    /**
     * @swagger
     * /bills/{id}:
     *   put:
     *     summary: Actualiza una factura existente
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la factura
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Factura'
     *     responses:
     *       200:
     *         description: Factura actualizada exitosamente
     *       400:
     *         description: Datos inválidos
     *       403:
     *         description: No tiene permiso
     *       404:
     *         description: Factura no encontrada
     */
    .put('/:id', auth, role(['admin']), BillsControllers.updateBill)

    /**
     * @swagger
     * /bills/{id}:
     *   delete:
     *     summary: Elimina una factura
     *     tags: [Facturas]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la factura
     *     responses:
     *       200:
     *         description: Factura eliminada exitosamente
     *       403:
     *         description: No tiene permiso
     *       404:
     *         description: Factura no encontrada
     */
    .delete('/:id', auth, role(['admin']), BillsControllers.deleteBill)




export default router;
