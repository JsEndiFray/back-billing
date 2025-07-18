import express from "express";
import UsersController from "../controllers/usersControllers.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import {validateUser} from "../validator/validatorUsers.js";
import errorHandler from '../middlewares/errorHandler.js';

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios
 */
const router = express.Router()

    //Buscar usuario admin

    /**
     * @swagger
     * /users/search/username/{username}:
     *   get:
     *     summary: Buscar usuario por nombre de usuario
     *     tags: [Usuarios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: username
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre de usuario
     *     responses:
     *       200:
     *         description: Usuario encontrado
     *       404:
     *         description: No encontrado
     */
    .get('/search/username/:username', auth, role(['admin']), UsersController.getUsername)

    /**
     * @swagger
     * /users/search/email/{email}:
     *   get:
     *     summary: Buscar usuario por email
     *     tags: [Usuarios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: email
     *         required: true
     *         schema:
     *           type: string
     *         description: Correo electrónico
     *     responses:
     *       200:
     *         description: Usuario encontrado
     *       404:
     *         description: No encontrado
     */
    .get('/search/email/:email', auth, role(['admin']), UsersController.getEmail)

    /**
     * @swagger
     * /users/search/phone/{phone}:
     *   get:
     *     summary: Buscar usuario por número de teléfono
     *     tags: [Usuarios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: phone
     *         required: true
     *         schema:
     *           type: string
     *         description: Teléfono del usuario
     *     responses:
     *       200:
     *         description: Usuario encontrado
     *       404:
     *         description: No encontrado
     */
    .get('/search/phone/:phone', auth, role(['admin']), UsersController.getPhone)

    //Ver usuarios admin y employee

    /**
     * @swagger
     * /users:
     *   get:
     *     summary: Obtener todos los usuarios
     *     tags: [Usuarios]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de usuarios
     */
    .get('/', auth, role(['admin', 'employee']), UsersController.getAllUsers)

    /**
     * @swagger
     * /users/{id}:
     *   get:
     *     summary: Obtener usuario por ID
     *     tags: [Usuarios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del usuario
     *     responses:
     *       200:
     *         description: Usuario encontrado
     *       404:
     *         description: No encontrado
     */
    .get('/:id', auth, role(['admin', 'employee']), UsersController.getUserId)

    //Crear, actualizar y eliminar usuarios solo admin

    /**
     * @swagger
     * /users:
     *   post:
     *     summary: Crear un nuevo usuario
     *     tags: [Usuarios]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [username, email, password]
     *             properties:
     *               username:
     *                 type: string
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *             example:
     *               username: endi
     *               email: endi@example.com
     *               password: 123456
     *     responses:
     *       201:
     *         description: Usuario creado
     *       400:
     *         description: Datos inválidos
     */
    .post('/', ...validateUser, errorHandler, UsersController.createUser)

    /**
     * @swagger
     * /users/{id}:
     *   put:
     *     summary: Actualizar un usuario
     *     tags: [Usuarios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del usuario
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               phone:
     *                 type: string
     *             example:
     *               email: nuevo@example.com
     *               phone: 600123123
     *     responses:
     *       200:
     *         description: Usuario actualizado
     *       400:
     *         description: Datos inválidos
     *       404:
     *         description: No encontrado
     */
    .put('/:id', auth, role(['admin']), ...validateUser, errorHandler, UsersController.updateUser)

    /**
     * @swagger
     * /users/{id}:
     *   delete:
     *     summary: Eliminar un usuario
     *     tags: [Usuarios]
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
     *         description: Usuario eliminado
     *       404:
     *         description: No encontrado
     */
    .delete('/:id', auth, role(['admin']), UsersController.deleteUser)


export default router;