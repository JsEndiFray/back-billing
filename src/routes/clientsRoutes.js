import express from "express";
import ClientsControllers from "../controllers/clientsControllers.js";
import {validateClient} from "../validator/validatorClients.js";
import errorHandler from "../middlewares/errorHandler.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: API para gestión de clientes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       required:
 *         - client_type
 *         - identification
 *       properties:
 *         id:
 *           type: string
 *           description: ID auto-generado del cliente
 *         client_type:
 *           type: string
 *           enum: [particular, empresa]
 *           description: Tipo de cliente
 *         identification:
 *           type: string
 *           description: NIF/CIF del cliente
 *         first_name:
 *           type: string
 *           description: Nombre del cliente (si es particular)
 *         last_name:
 *           type: string
 *           description: Apellidos del cliente (si es particular)
 *         company_name:
 *           type: string
 *           description: Nombre de la empresa (si es empresa)
 *         email:
 *           type: string
 *           format: email
 *           description: Email del cliente
 *         phone:
 *           type: string
 *           description: Teléfono del cliente
 *         address:
 *           type: string
 *           description: Dirección del cliente
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *       example:
 *         id: "1"
 *         client_type: "particular"
 *         identification: "12345678Z"
 *         first_name: "Juan"
 *         last_name: "Pérez"
 *         email: "juan@ejemplo.com"
 *         phone: "600123456"
 *         address: "Calle Principal 123"
 *         notes: "Cliente VIP"
 */

const router = express.Router()

    /**
     * @swagger
     * /clients/companies:
     *   get:
     *     summary: Obtiene lista de empresas para dropdown
     *     tags: [Clientes]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de empresas
     */
    .get('/companies', auth, role(['admin', 'employee']), ClientsControllers.getCompanies)

    /**
     * @swagger
     * /clients/autonoms-with-companies:
     *   get:
     *     summary: Obtiene autónomos con información de empresa
     *     tags: [Clientes]
     *     security:
     *       - bearerAuth: []
     */
    .get('/autonoms-with-companies', auth, role(['admin', 'employee']), ClientsControllers.getAutonomsWithCompanies)

    /**
     * @swagger
     * /clients/company/{companyId}/administrators:
     *   get:
     *     summary: Obtiene administradores de una empresa
     *     tags: [Clientes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: companyId
     *         required: true
     *         schema:
     *           type: integer
     */
    .get('/company/:companyId/administrators', auth, role(['admin', 'employee']), ClientsControllers.getAdministratorsByCompany)

    //Búsquedas admin y employee
    /**
     * @swagger
     * /clients/type/{clientType}:
     *   get:
     *     summary: Obtiene clientes por tipo
     *     tags: [Clientes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: clientType
     *         schema:
     *           type: string
     *           enum: [particular, empresa]
     *         required: true
     *         description: Tipo de cliente
     *     responses:
     *       200:
     *         description: Lista de clientes por tipo
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Cliente'
     *       401:
     *         description: No autorizado
     *       403:
     *         description: No tiene permiso
     */
    .get('/type/:clientType', auth, role(['admin', 'employee']), ClientsControllers.getByClientType)

    /**
     * @swagger
     * /clients/search/company/{company_name}:
     *   get:
     *     summary: Busca clientes por nombre de empresa
     *     tags: [Clientes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: company_name
     *         schema:
     *           type: string
     *         required: true
     *         description: Nombre de la empresa a buscar
     *     responses:
     *       200:
     *         description: Clientes encontrados
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Cliente'
     */
    .get('/search/company/:company_name', auth, role(['admin', 'employee']), ClientsControllers.getCompany)

    /**
     * @swagger
     * /clients/search/fullname:
     *   get:
     *     summary: Busca clientes por nombre completo
     *     tags: [Clientes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: first_name
     *         schema:
     *           type: string
     *         description: Nombre del cliente
     *       - in: query
     *         name: last_name
     *         schema:
     *           type: string
     *         description: Apellidos del cliente
     *     responses:
     *       200:
     *         description: Clientes encontrados
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Cliente'
     */
    .get('/search/fullname', auth, role(['admin', 'employee']), ClientsControllers.getFullName)

    /**
     * @swagger
     * /clients/search/identification/{identification}:
     *   get:
     *     summary: Busca cliente por identificación (NIF/CIF)
     *     tags: [Clientes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: identification
     *         schema:
     *           type: string
     *         required: true
     *         description: NIF/CIF del cliente
     *     responses:
     *       200:
     *         description: Cliente encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Cliente'
     *       404:
     *         description: Cliente no encontrado
     */
    .get('/search/identification/:identification', auth, role(['admin', 'employee']), ClientsControllers.getByIdentification)

    /**
     * @swagger
     * /clients/dropdown:
     *   get:
     *     summary: Obtiene lista de clientes para desplegables
     *     tags: [Clientes]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de clientes para dropdown
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                   label:
     *                     type: string
     */
    .get('/dropdown', auth, role(['admin', 'employee']), ClientsControllers.getAllForDropdownClients)

    //Obtener clientes admin y employee
    /**
     * @swagger
     * /clients:
     *   get:
     *     summary: Obtiene todos los clientes
     *     tags: [Clientes]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de todos los clientes
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Cliente'
     */
    .get('/', auth, role(['admin', 'employee']), ClientsControllers.getAllClients)

    /**
     * @swagger
     * /clients/{id}:
     *   get:
     *     summary: Obtiene un cliente por ID
     *     tags: [Clientes]
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
     *         description: Cliente encontrado
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Cliente'
     *       404:
     *         description: Cliente no encontrado
     */
    .get('/:id', auth, role(['admin', 'employee']), ClientsControllers.getById)

    //Crear, actualizar y eliminar solo admin

    /**
     * @swagger
     * /clients:
     *   post:
     *     summary: Crea un nuevo cliente
     *     tags: [Clientes]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Cliente'
     *     responses:
     *       201:
     *         description: Cliente creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Cliente'
     *       400:
     *         description: Datos inválidos
     *       403:
     *         description: No tiene permiso
     */
    .post('/', auth, role(['admin', 'employee']), validateClient, errorHandler, ClientsControllers.createClient)

    /**
     * @swagger
     * /clients/{id}:
     *   put:
     *     summary: Actualiza un cliente existente
     *     tags: [Clientes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID del cliente
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Cliente'
     *     responses:
     *       200:
     *         description: Cliente actualizado exitosamente
     *       400:
     *         description: Datos inválidos
     *       403:
     *         description: No tiene permiso
     *       404:
     *         description: Cliente no encontrado
     */
    .put('/:id', auth, role(['admin']), validateClient, errorHandler, ClientsControllers.updateClient)

    /**
     * @swagger
     * /clients/{id}:
     *   delete:
     *     summary: Elimina un cliente
     *     tags: [Clientes]
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
     *         description: Cliente eliminado exitosamente
     *       403:
     *         description: No tiene permiso
     *       404:
     *         description: Cliente no encontrado
     */
    .delete('/:id', auth, role(['admin']), ClientsControllers.deleteClient)

export default router;