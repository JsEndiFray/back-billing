import express from "express";
import EstateOwnersController from "../controllers/estatesOwnersControllers.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";


/**
 * @swagger
 * tags:
 *   name: Inmuebles-Propietarios
 *   description: Relación entre inmuebles y propietarios
 */
const router = express.Router()

    // --- Rutas de Consulta (GET) ---

    /**
     * @swagger
     * /estates-owners:
     *   get:
     *     summary: Obtener todas las relaciones entre inmuebles y propietarios
     *     tags: [Inmuebles-Propietarios]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de relaciones
     *       403:
     *         description: No autorizado
     */
    // Ver estate owners
    .get("/", auth, role(['employee', 'admin']), EstateOwnersController.getAllEstateOwners)

    /**
     * @swagger
     * /estates-owners/{id}:
     *   get:
     *     summary: Obtener una relación por ID
     *     tags: [Inmuebles-Propietarios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de la relación
     *     responses:
     *       200:
     *         description: Relación encontrada
     *       404:
     *         description: No encontrada
     *       400:
     *         description: ID inválido
     *       403:
     *         description: No autorizado
     */
    //búsqueda por ID
    .get("/:id", auth, role(['employee', 'admin']), EstateOwnersController.getEstateOwnersById)

    /**
     * @swagger
     * /estates-owners:
     *   post:
     *     summary: Crear una nueva relación entre inmueble y propietario
     *     tags: [Inmuebles-Propietarios]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - estate_id
     *               - owner_id
     *               - ownership_percent
     *             properties:
     *               estate_id:
     *                 type: integer
     *               owner_id:
     *                 type: integer
     *               ownership_percent:
     *                 type: number
     *             example:
     *               estate_id: 1
     *               owner_id: 2
     *               ownership_percent: 50
     *     responses:
     *       201:
     *         description: Relación creada
     *       400:
     *         description: Datos inválidos
     *       403:
     *         description: No autorizado
     */
    // Crear
    .post("/", auth, role(['admin']), EstateOwnersController.createEstateOwners)
    /**
     * @swagger
     * /estates-owners/{id}:
     *   put:
     *     summary: Actualizar una relación por ID
     *     tags: [Inmuebles-Propietarios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de la relación
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               ownership_percent:
     *                 type: number
     *             example:
     *               ownership_percent: 75
     *     responses:
     *       200:
     *         description: Relación actualizada
     *       404:
     *         description: No encontrada
     *       403:
     *         description: No autorizado
     */
    // Actualizar por ID ÚNICO
    .put("/:id", auth, role(['admin']), EstateOwnersController.updateEstateOwners)

    /**
     * @swagger
     * /estates-owners/{id}:
     *   delete:
     *     summary: Eliminar una relación por ID
     *     tags: [Inmuebles-Propietarios]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de la relación
     *     responses:
     *       200:
     *         description: Relación eliminada
     *       404:
     *         description: No encontrada
     *       403:
     *         description: No autorizado
     */
    // Eliminar por ID ÚNICO
    .delete("/:id", auth, role(['admin']), EstateOwnersController.deleteEstateOwners)

export default router;