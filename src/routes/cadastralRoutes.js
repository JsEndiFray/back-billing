import express from 'express';
import CadastralController from '../controllers/cadastralController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';

/**
 * @swagger
 * tags:
 *   name: Validación Catastral
 *   description: Validación de referencias catastrales
 */
const router = express.Router()

    /**
     * @swagger
     * /cadastral/validate/{reference}:
     *   get:
     *     summary: Validar referencia catastral
     *     tags: [Validación Catastral]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: reference
     *         schema:
     *           type: string
     *         required: true
     *         description: Referencia catastral (20 caracteres)
     *         example: "1234567AB1234C0001XY"
     *     responses:
     *       200:
     *         description: Validación completada
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 isValid:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 cadastral_reference:
     *                   type: string
     *                 validation_time:
     *                   type: string
     *       400:
     *         description: Referencia catastral faltante o inválida
     *       500:
     *         description: Error del servidor
     */
    .get('/validate/:reference', auth, role(['admin', 'employee']), CadastralController.validateCadastralReference)

    /**
     * @swagger
     * /cadastral/health:
     *   get:
     *     summary: Verificar estado del servicio
     *     tags: [Validación Catastral]
     *     responses:
     *       200:
     *         description: Servicio funcionando
     */
    .get('/health', CadastralController.healthCheck);

export default router;