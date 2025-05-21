import express from "express";
import OwnersControllers from "../controllers/ownersControllers.js";
import {validateOwners} from "../validator/validatorOwners.js";
import errorHandler from "../middlewares/errorHandler.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

/**
 * @swagger
 * tags:
 *   name: Propietarios
 *   description: Gestión de propietarios
 */
const router = express.Router()

    //Buscar propietarios admin y employee

    /**
     * @swagger
     * /owners/search/name:
     *   get:
     *     summary: Buscar propietario por nombre
     *     tags: [Propietarios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: name
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre del propietario
     *     responses:
     *       200:
     *         description: Propietario encontrado
     *       404:
     *         description: No encontrado
     */
    .get('/search/name', auth, role(['admin', 'employee']), OwnersControllers.getOwner)

    /**
     * @swagger
     * /owners/dropdown:
     *   get:
     *     summary: Lista simplificada de propietarios
     *     tags: [Propietarios]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista para desplegables
     */
    .get('/dropdown', auth, role(['admin', 'employee']), OwnersControllers.getAllForDropdownOwners)

    //Obtener propietarios admin y employee

    /**
     * @swagger
     * /owners:
     *   get:
     *     summary: Obtener todos los propietarios
     *     tags: [Propietarios]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista completa
     */
    .get('/', auth, role(['admin', 'employee']), OwnersControllers.getAllOwners)

    /**
     * @swagger
     * /owners/{id}:
     *   get:
     *     summary: Obtener un propietario por ID
     *     tags: [Propietarios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID del propietario
     *     responses:
     *       200:
     *         description: Propietario encontrado
     *       404:
     *         description: No encontrado
     */
    .get('/:id', auth, role(['admin', 'employee']), OwnersControllers.getOwnerId)


    //Crear, actualizar y eliminar solo admin

    /**
     * @swagger
     * /owners:
     *   post:
     *     summary: Crear nuevo propietario
     *     tags: [Propietarios]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [name, lastname, email, nif]
     *             properties:
     *               name:
     *                 type: string
     *               lastname:
     *                 type: string
     *               email:
     *                 type: string
     *               nif:
     *                 type: string
     *             example:
     *               name: Juan
     *               lastname: Pérez
     *               email: juan@example.com
     *               nif: 12345678A
     *     responses:
     *       201:
     *         description: Propietario creado
     *       400:
     *         description: Datos inválidos
     */
    .post('/', auth, role(['admin']), validateOwners, errorHandler, OwnersControllers.createOwner)

    /**
     * @swagger
     * /owners/{id}:
     *   put:
     *     summary: Actualizar propietario
     *     tags: [Propietarios]
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
     *               email:
     *                 type: string
     *               address:
     *                 type: string
     *             example:
     *               email: nuevo@example.com
     *               address: Calle Nueva 123
     *     responses:
     *       200:
     *         description: Actualizado
     *       400:
     *         description: Datos inválidos
     *       404:
     *         description: No encontrado
     */
    .put('/:id', auth, role(['admin']), validateOwners, errorHandler, OwnersControllers.updateOwner)

    /**
     * @swagger
     * /owners/{id}:
     *   delete:
     *     summary: Eliminar propietario
     *     tags: [Propietarios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID del propietario
     *     responses:
     *       200:
     *         description: Eliminado
     *       404:
     *         description: No encontrado
     */
    .delete('/:id', auth, role(['admin']), OwnersControllers.deleteOwner)

export default router;