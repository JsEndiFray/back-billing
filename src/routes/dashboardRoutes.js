import express from 'express';
import DashboardController from '../controllers/dashboardController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';

const router = express.Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Obtiene estadísticas del panel de control
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todayIncome:
 *                   type: number
 *                 activeClients:
 *                   type: integer
 *                 newClients:
 *                   type: integer
 *                 totalSales:
 *                   type: number
 *                 pendingInvoices:
 *                   type: integer
 *                 activeProperties:
 *                   type: integer
 *                 activeEmployees:
 *                   type: integer
 */
router.get('/stats', auth, role(['admin', 'employee']), DashboardController.getStats);

export default router;
