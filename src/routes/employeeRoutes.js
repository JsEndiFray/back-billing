import express from 'express'
import EmployeeControllers from "../controllers/employeeControllers.js";
import errorHandler from "../middlewares/errorHandler.js";
import {validaEmployee} from "../validator/validatorEmployee.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

/**
 * @swagger
 * tags:
 *   name: Empleados
 *   description: Gestión de empleados
 */
const router = express.Router()

    /**
     * @swagger
     * /employee/search:
     *   get:
     *     summary: Buscar empleados por diferentes criterios
     *     tags: [Empleados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *         description: Nombre del empleado
     *         example: "Pedro"
     *       - in: query
     *         name: lastname
     *         schema:
     *           type: string
     *         description: Apellido del empleado
     *         example: "García"
     *       - in: query
     *         name: identification
     *         schema:
     *           type: string
     *         description: Identificación del empleado
     *         example: "12345678A"
     *     responses:
     *       200:
     *         description: Empleados encontrados
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                   name:
     *                     type: string
     *                   lastname:
     *                     type: string
     *                   email:
     *                     type: string
     *                   identification:
     *                     type: string
     *                   phone:
     *                     type: string
     *                   address:
     *                     type: string
     *                   postal_code:
     *                     type: string
     *                   location:
     *                     type: string
     *                   province:
     *                     type: string
     *                   country:
     *                     type: string
     *       404:
     *         description: No se encontraron empleados
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "Empleado no encontrado"
     *       500:
     *         description: Error interno del servidor
     */
    .get('/search', auth, role(['admin', 'employee']), EmployeeControllers.getEmployee)

    /**
     * @swagger
     * /employee:
     *   get:
     *     summary: Obtener todos los empleados
     *     tags: [Empleados]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista completa de empleados
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                   name:
     *                     type: string
     *                   lastname:
     *                     type: string
     *                   email:
     *                     type: string
     *                   identification:
     *                     type: string
     *       500:
     *         description: Error interno del servidor
     */
    .get('/', auth, role(['admin', 'employee']), EmployeeControllers.getAllEmployee)

    /**
     * @swagger
     * /employee/{id}:
     *   get:
     *     summary: Obtener un empleado por ID
     *     tags: [Empleados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID del empleado
     *         example: 1
     *     responses:
     *       200:
     *         description: Empleado encontrado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                 name:
     *                   type: string
     *                 lastname:
     *                   type: string
     *                 email:
     *                   type: string
     *                 identification:
     *                   type: string
     *                 phone:
     *                   type: string
     *                 address:
     *                   type: string
     *                 postal_code:
     *                   type: string
     *                 location:
     *                   type: string
     *                 province:
     *                   type: string
     *                 country:
     *                   type: string
     *       404:
     *         description: Empleado no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    .get('/:id', auth, role(['admin', 'employee']), EmployeeControllers.getEmployeeById)

    /**
     * @swagger
     * /employee:
     *   post:
     *     summary: Crear nuevo empleado
     *     tags: [Empleados]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [name, lastname, email, identification, phone, address, postal_code, location, province, country]
     *             properties:
     *               name:
     *                 type: string
     *                 description: Nombre del empleado
     *                 example: "Juan"
     *               lastname:
     *                 type: string
     *                 description: Apellido del empleado
     *                 example: "Pérez"
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Email del empleado
     *                 example: "juan.perez@example.com"
     *               identification:
     *                 type: string
     *                 description: Identificación del empleado (DNI/NIE)
     *                 example: "12345678A"
     *               phone:
     *                 type: string
     *                 description: Teléfono del empleado
     *                 example: "666777888"
     *               address:
     *                 type: string
     *                 description: Dirección del empleado
     *                 example: "Calle Mayor 123"
     *               postal_code:
     *                 type: string
     *                 description: Código postal
     *                 example: "28013"
     *               location:
     *                 type: string
     *                 description: Localidad
     *                 example: "Madrid"
     *               province:
     *                 type: string
     *                 description: Provincia
     *                 example: "Madrid"
     *               country:
     *                 type: string
     *                 description: País
     *                 example: "España"
     *     responses:
     *       201:
     *         description: Empleado creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                 name:
     *                   type: string
     *                 lastname:
     *                   type: string
     *                 email:
     *                   type: string
     *                 identification:
     *                   type: string
     *       400:
     *         description: Datos inválidos o empleado ya existe
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "Ya existe un empleado con esa identificación"
     *       500:
     *         description: Error interno del servidor
     */
    .post('/', auth, role(['admin']), validaEmployee, errorHandler, EmployeeControllers.createEmployee)

    /**
     * @swagger
     * /employee/{id}:
     *   put:
     *     summary: Actualizar empleado
     *     tags: [Empleados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del empleado a actualizar
     *         example: 1
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 description: Nombre del empleado
     *                 example: "Juan Carlos"
     *               lastname:
     *                 type: string
     *                 description: Apellido del empleado
     *                 example: "Pérez García"
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Email del empleado
     *                 example: "juan.perez@example.com"
     *               identification:
     *                 type: string
     *                 description: Identificación del empleado (DNI/NIE)
     *                 example: "12345678B"
     *               phone:
     *                 type: string
     *                 description: Teléfono del empleado
     *                 example: "666777888"
     *               address:
     *                 type: string
     *                 description: Dirección del empleado
     *                 example: "Calle Nueva 456"
     *               postal_code:
     *                 type: string
     *                 description: Código postal
     *                 example: "28014"
     *               location:
     *                 type: string
     *                 description: Localidad
     *                 example: "Madrid"
     *               province:
     *                 type: string
     *                 description: Provincia
     *                 example: "Madrid"
     *               country:
     *                 type: string
     *                 description: País
     *                 example: "España"
     *             example:
     *               name: "Juan Carlos"
     *               lastname: "Pérez García"
     *               email: "juan.carlos@example.com"
     *               phone: "666999888"
     *               address: "Calle Nueva 456"
     *     responses:
     *       200:
     *         description: Empleado actualizado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                 name:
     *                   type: string
     *                 lastname:
     *                   type: string
     *                 email:
     *                   type: string
     *                 identification:
     *                   type: string
     *       400:
     *         description: Datos inválidos
     *       404:
     *         description: Empleado no encontrado o no se pudo actualizar
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "Empleado no encontrado"
     *       409:
     *         description: Conflicto - identificación duplicada
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "Ya existe un empleado con esa identificación"
     *       500:
     *         description: Error interno del servidor
     */
    .put('/:id', auth, role(['admin']), validaEmployee, errorHandler, EmployeeControllers.updateEmployee)

    /**
     * @swagger
     * /employee/{id}:
     *   delete:
     *     summary: Eliminar un empleado
     *     description: Elimina permanentemente un empleado del sistema. Solo disponible para administradores.
     *     tags: [Empleados]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *           minimum: 1
     *         required: true
     *         description: ID único del empleado a eliminar
     *         example: 5
     *     responses:
     *       200:
     *         description: Empleado eliminado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Empleado eliminado correctamente"
     *                 deletedEmployee:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       example: 5
     *                     name:
     *                       type: string
     *                       example: "Juan"
     *                     lastname:
     *                       type: string
     *                       example: "Pérez"
     *                     email:
     *                       type: string
     *                       example: "juan.perez@example.com"
     *       400:
     *         description: ID inválido
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "ID inválido"
     *       401:
     *         description: No autorizado - Token requerido
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "Token de acceso requerido"
     *       403:
     *         description: Prohibido - Solo administradores
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "Acceso denegado. Solo administradores pueden eliminar empleados"
     *       404:
     *         description: Empleado no encontrado
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "Empleado no encontrado"
     *       409:
     *         description: Conflicto - No se puede eliminar
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "No se puede eliminar empleado con proyectos activos"
     *       500:
     *         description: Error interno del servidor
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: "Error interno del servidor"
     */
    .delete('/:id', auth, role(['admin']), EmployeeControllers.deleteEmployee)
export default router;