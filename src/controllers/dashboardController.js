import DashboardServices from '../services/dashboardServices.js';

/**
 * Controlador para estadísticas del panel de control.
 */
export default class DashboardController {

    static async getStats(req, res, next) {
        try {
            const stats = await DashboardServices.getStats();
            return res.status(200).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }
}
