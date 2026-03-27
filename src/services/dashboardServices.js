import DashboardRepository from '../repository/dashboardRepository.js';

/**
 * Servicio para estadísticas del panel de control.
 */
export default class DashboardServices {

    static async getStats() {
        return await DashboardRepository.getStats();
    }
}
