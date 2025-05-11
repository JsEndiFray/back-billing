import express from "express";
import EstateController from "../controllers/estatesControllers.js";
import {validateEstate} from "../validator/validatorEstates.js";
import errorHandler from "../middlewares/errorHandler.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

/**
 * @swagger
 * tags:
 *   name: Inmuebles
 *   description: Gestión de inmuebles
 */
const router = express.Router()

    //Buscar inmuebles admin y employee

    /**
     * @swagger
     * /estates/search/cadastral/{cadastral}:
     *   get:
     *     summary: Buscar inmueble por referencia catastral
     *     tags: [Inmuebles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: cadastral
     *         schema:
     *           type: string
     *         required: true
     *         description: Referencia catastral
     *     responses:
     *       200:
     *         description: Inmueble encontrado
     *       404:
     *         description: No encontrado
     */
    .get('/search/cadastral/:cadastral', auth, role(['admin', 'employee']), EstateController.getByCadastralReference)

    /**
     * @swagger
     * /estates/dropdown/list:
     *   get:
     *     summary: Obtener lista simplificada de inmuebles
     *     tags: [Inmuebles]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de inmuebles
     */
    .get('/dropdown/list', auth, role(['admin', 'employee']), EstateController.getAllForDropdownEstates)

    //Obtener inmuebles admin y employee

    /**
     * @swagger
     * /estates:
     *   get:
     *     summary: Obtener todos los inmuebles
     *     tags: [Inmuebles]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de inmuebles
     */
    .get('/', auth, role(['admin', 'employee']), EstateController.getAllEstate)
    /**
     * @swagger
     * /estates/{id}:
     *   get:
     *     summary: Obtener un inmueble por ID
     *     tags: [Inmuebles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID del inmueble
     *     responses:
     *       200:
     *         description: Inmueble encontrado
     *       404:
     *         description: No encontrado
     */
    .get('/:id', auth, role(['admin', 'employee']), EstateController.getById)


    //Crear, actualizar y eliminar solo admin

    /**
     * @swagger
     * /estates:
     *   post:
     *     summary: Crear un nuevo inmueble
     *     tags: [Inmuebles]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - cadastral_reference
     *               - address
     *             properties:
     *               cadastral_reference:
     *                 type: string
     *               address:
     *                 type: string
     *               price:
     *                 type: number
     *               surface:
     *                 type: number
     *             example:
     *               cadastral_reference: "1234567AB1234C0001XY"
     *               address: "Calle Mayor, 1"
     *               price: 120000
     *               surface: 80
     *     responses:
     *       201:
     *         description: Inmueble creado
     *       400:
     *         description: Datos inválidos
     */
    .post('/', auth, role(['admin', 'employee']), validateEstate, errorHandler, EstateController.createEstate)

    /**
     * @swagger
     * /estates/{id}:
     *   put:
     *     summary: Actualizar inmueble existente
     *     tags: [Inmuebles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               address:
     *                 type: string
     *               price:
     *                 type: number
     *               surface:
     *                 type: number
     *     responses:
     *       200:
     *         description: Inmueble actualizado
     *       400:
     *         description: Datos inválidos
     *       404:
     *         description: No encontrado
     */
    .put('/:id', auth, role(['admin']), validateEstate, errorHandler, EstateController.updateEstate)

    /**
     * @swagger
     * /estates/{id}:
     *   delete:
     *     summary: Eliminar inmueble
     *     tags: [Inmuebles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Inmueble eliminado
     *       404:
     *         description: No encontrado
     */
    .delete('/:id', auth, role(['admin']), EstateController.deleteEstate)

export default router;