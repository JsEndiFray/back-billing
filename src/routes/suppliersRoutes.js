import express from 'express';
import SuppliersController from "../controllers/suppliersControllers.js";
import {validateCreateSupplier} from "../validator/validatorSuppliers.js";
import errorHandler from "../middlewares/errorHandler.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

/**
 * @swagger
 * tags:
 *   name: Proveedores
 *   description: API para gestión de proveedores
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Proveedor:
 *       type: object
 *       required:
 *         - name
 *         - tax_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-generado del proveedor
 *         name:
 *           type: string
 *           description: Nombre del proveedor (persona física)
 *         company_name:
 *           type: string
 *           description: Nombre de la empresa (si es persona jurídica)
 *         tax_id:
 *           type: string
 *           description: CIF/NIF del proveedor
 *         address:
 *           type: string
 *           description: Dirección del proveedor
 *         postal_code:
 *           type: string
 *           description: Código postal
 *         city:
 *           type: string
 *           description: Ciudad
 *         province:
 *           type: string
 *           description: Provincia
 *         country:
 *           type: string
 *           default: España
 *           description: País
 *         phone:
 *           type: string
 *           description: Teléfono de contacto
 *         email:
 *           type: string
 *           format: email
 *           description: Email de contacto
 *         contact_person:
 *           type: string
 *           description: Persona de contacto
 *         payment_terms:
 *           type: integer
 *           default: 30
 *           minimum: 0
 *           maximum: 365
 *           description: Términos de pago en días
 *         bank_account:
 *           type: string
 *           description: Cuenta bancaria del proveedor
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *         active:
 *           type: boolean
 *           default: true
 *           description: Si el proveedor está activo
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         # Campo calculado para mostrar
 *         display_name:
 *           type: string
 *           readOnly: true
 *           description: Nombre para mostrar (company_name o name)
 *       example:
 *         id: 1
 *         name: "Juan Pérez"
 *         company_name: "Electricidad Pérez S.L."
 *         tax_id: "B12345678"
 *         address: "Calle Mayor 123"
 *         postal_code: "28001"
 *         city: "Madrid"
 *         province: "Madrid"
 *         country: "España"
 *         phone: "600123456"
 *         email: "juan@electricidadperez.com"
 *         contact_person: "Juan Pérez"
 *         payment_terms: 30
 *         active: true
 *
 *     EstadisticasProveedores:
 *       type: object
 *       properties:
 *         total_suppliers:
 *           type: integer
 *           description: Total de proveedores
 *         active_suppliers:
 *           type: integer
 *           description: Proveedores activos
 *         inactive_suppliers:
 *           type: integer
 *           description: Proveedores inactivos
 *         percentage_active:
 *           type: integer
 *           description: Porcentaje de proveedores activos
 *
 *     SugerenciaProveedor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del proveedor
 *         label:
 *           type: string
 *           description: Nombre para mostrar
 *         tax_id:
 *           type: string
 *           description: CIF/NIF del proveedor
 *         payment_terms:
 *           type: integer
 *           description: Términos de pago
 *       example:
 *         id: 1
 *         label: "Electricidad Pérez S.L."
 *         tax_id: "B12345678"
 *         payment_terms: 30
 */

const router = express.Router()

    // ==========================================
    // RUTAS DE CONSULTA (GET)
    // ==========================================

    /**
     * @swagger
     * /suppliers:
     *   get:
     *     summary: Obtiene todos los proveedores activos
     *     tags: [Proveedores]
     *     responses:
     *       200:
     *         description: Lista de proveedores activos
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Proveedor'
     *       404:
     *         description: No se encontraron proveedores
     */
    .get('/', auth, role(['admin', 'employee']), SuppliersController.getAllSuppliers)

    /**
     * @swagger
     * /suppliers/all:
     *   get:
     *     summary: Obtiene todos los proveedores (incluyendo inactivos)
     *     tags: [Proveedores]
     *     responses:
     *       200:
     *         description: Lista de todos los proveedores
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 allOf:
     *                   - $ref: '#/components/schemas/Proveedor'
     *                   - type: object
     *                     properties:
     *                       display_name:
     *                         type: string
     *                         description: Nombre para mostrar
     *       404:
     *         description: No se encontraron proveedores
     */
    .get('/all', auth, role(['admin', 'employee']), SuppliersController.getAllSuppliersIncludingInactive)

    /**
     * @swagger
     * /suppliers/stats:
     *   get:
     *     summary: Obtiene estadísticas de proveedores
     *     tags: [Proveedores]
     *     responses:
     *       200:
     *         description: Estadísticas de proveedores
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/EstadisticasProveedores'
     *       500:
     *         description: Error interno del servidor
     */
    .get('/stats', auth, role(['admin', 'employee']), SuppliersController.getSupplierStats)

    /**
     * @swagger
     * /suppliers/suggestions:
     *   get:
     *     summary: Obtiene sugerencias para autocompletado
     *     tags: [Proveedores]
     *     parameters:
     *       - in: query
     *         name: q
     *         required: true
     *         schema:
     *           type: string
     *           minLength: 2
     *         description: Término de búsqueda para autocompletado
     *         example: "iber"
     *     responses:
     *       200:
     *         description: Lista de sugerencias
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/SugerenciaProveedor'
     *       400:
     *         description: Query debe tener al menos 2 caracteres
     */
    .get('/suggestions', auth, role(['admin', 'employee']), SuppliersController.getSupplierSuggestions)

    /**
     * @swagger
     * /suppliers/search/{name}:
     *   get:
     *     summary: Busca proveedores por nombre
     *     tags: [Proveedores]
     *     parameters:
     *       - in: path
     *         name: name
     *         required: true
     *         schema:
     *           type: string
     *           minLength: 2
     *         description: Nombre o parte del nombre a buscar
     *         example: "electricidad"
     *     responses:
     *       200:
     *         description: Proveedores encontrados
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Proveedor'
     *       400:
     *         description: El nombre debe tener al menos 2 caracteres
     *       404:
     *         description: No se encontraron proveedores con ese nombre
     */
    .get('/search/:name', auth, role(['admin', 'employee']), SuppliersController.getSuppliersByName)

    /**
     * @swagger
     * /suppliers/tax/{tax_id}:
     *   get:
     *     summary: Busca proveedor por CIF/NIF
     *     tags: [Proveedores]
     *     parameters:
     *       - in: path
     *         name: tax_id
     *         required: true
     *         schema:
     *           type: string
     *         description: CIF/NIF del proveedor
     *         example: "B12345678"
     *     responses:
     *       200:
     *         description: Proveedor encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Proveedor'
     *       400:
     *         description: CIF/NIF requerido o formato inválido
     *       404:
     *         description: Proveedor no encontrado con ese CIF/NIF
     */
    .get('/tax/:tax_id', auth, role(['admin', 'employee']), SuppliersController.getSupplierByTaxId)

    /**
     * @swagger
     * /suppliers/payment-terms/{payment_terms}:
     *   get:
     *     summary: Busca proveedores por términos de pago
     *     tags: [Proveedores]
     *     parameters:
     *       - in: path
     *         name: payment_terms
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 0
     *           maximum: 365
     *         description: Términos de pago en días
     *         example: 30
     *     responses:
     *       200:
     *         description: Proveedores encontrados
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Proveedor'
     *       400:
     *         description: Términos de pago inválidos
     *       404:
     *         description: No se encontraron proveedores con esos términos de pago
     */
    .get('/payment-terms/:payment_terms', auth, role(['admin', 'employee']), SuppliersController.getSuppliersByPaymentTerms)

    /**
     * @swagger
     * /suppliers/{id}:
     *   get:
     *     summary: Obtiene un proveedor específico por ID
     *     tags: [Proveedores]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del proveedor
     *     responses:
     *       200:
     *         description: Proveedor encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Proveedor'
     *       400:
     *         description: ID inválido
     *       404:
     *         description: Proveedor no encontrado
     */
    .get('/:id', auth, role(['admin', 'employee']), SuppliersController.getSupplierById)

    // ==========================================
    // RUTAS DE MODIFICACIÓN (POST, PUT, DELETE)
    // ==========================================

    /**
     * @swagger
     * /suppliers:
     *   post:
     *     summary: Crea un nuevo proveedor
     *     tags: [Proveedores]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Proveedor'
     *           example:
     *             name: "Juan Pérez"
     *             company_name: "Electricidad Pérez S.L."
     *             tax_id: "B12345678"
     *             email: "juan@electricidadperez.com"
     *             phone: "600123456"
     *             payment_terms: 30
     *             address: "Calle Mayor 123"
     *             city: "Madrid"
     *             province: "Madrid"
     *     responses:
     *       201:
     *         description: Proveedor creado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 supplier:
     *                   $ref: '#/components/schemas/Proveedor'
     *       400:
     *         description: Error en los datos proporcionados o CIF/NIF duplicado
     */
    .post('/', auth, role(['admin', 'employee']), validateCreateSupplier, errorHandler, SuppliersController.createSupplier)

    /**
     * @swagger
     * /suppliers/{id}:
     *   put:
     *     summary: Actualiza un proveedor existente
     *     tags: [Proveedores]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del proveedor
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Proveedor'
     *           example:
     *             name: "Juan Pérez García"
     *             payment_terms: 45
     *             phone: "600654321"
     *             notes: "Proveedor preferente"
     *     responses:
     *       200:
     *         description: Proveedor actualizado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 supplier:
     *                   $ref: '#/components/schemas/Proveedor'
     *       400:
     *         description: ID de proveedor inválido o error en los datos proporcionados
     *       404:
     *         description: Proveedor no encontrado
     */
    .put('/:id', auth, role(['admin', 'employee']), validateCreateSupplier, errorHandler, SuppliersController.updateSupplier)

    /**
     * @swagger
     * /suppliers/{id}/activate:
     *   put:
     *     summary: Reactiva un proveedor inactivo
     *     tags: [Proveedores]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del proveedor
     *     responses:
     *       200:
     *         description: Proveedor reactivado correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Proveedor reactivado correctamente"
     *       400:
     *         description: ID de proveedor inválido o error al reactivar proveedor
     */
    .put('/:id/activate', auth, role(['admin', 'employee']), SuppliersController.activateSupplier)

    /**
     * @swagger
     * /suppliers/{id}:
     *   delete:
     *     summary: Elimina un proveedor (borrado lógico)
     *     tags: [Proveedores]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del proveedor
     *     responses:
     *       204:
     *         description: Proveedor eliminado exitosamente
     *       400:
     *         description: ID de proveedor inválido o error al eliminar proveedor
     *       404:
     *         description: Proveedor no encontrado
     */
    .delete('/:id', auth, role(['admin', 'employee']), SuppliersController.deleteSupplier)

export default router;

/**
 * EJEMPLOS DE USO:
 *
 * // Obtener todos los proveedores activos
 * GET /api/suppliers
 *
 * // Buscar por nombre
 * GET /api/suppliers/search/iberdrola
 *
 * // Buscar por CIF
 * GET /api/suppliers/tax/B12345678
 *
 * // Crear nuevo proveedor
 * POST /api/suppliers
 * Body: {
 *   "name": "Juan Pérez",
 *   "tax_id": "12345678Z",
 *   "email": "juan@email.com",
 *   "payment_terms": 30
 * }
 *
 * // Actualizar proveedor
 * PUT /api/suppliers/123
 * Body: {
 *   "payment_terms": 45,
 *   "phone": "600123456"
 * }
 *
 * // Autocompletado
 * GET /api/suppliers/suggestions?q=iber
 *
 * // Estadísticas
 * GET /api/suppliers/stats
 */