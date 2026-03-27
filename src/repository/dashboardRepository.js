import db from '../db/dbConnect.js';

/**
 * Repositorio para estadísticas del panel de control.
 * Ejecuta todas las consultas en paralelo con Promise.all.
 */
export default class DashboardRepository {

    static async getStats() {
        const [
            [todayIncomeRows],
            [activeClientsRows],
            [newClientsRows],
            [totalSalesRows],
            [pendingInvoicesRows],
            [activePropertiesRows],
            [activeEmployeesRows]
        ] = await Promise.all([
            db.query(`
                SELECT COALESCE(SUM(total), 0) AS value
                FROM invoices_issued
                WHERE DATE(invoice_date) = CURDATE()
                  AND is_refund = FALSE
            `),
            db.query(`
                SELECT COUNT(*) AS value
                FROM clients
            `),
            db.query(`
                SELECT COUNT(*) AS value
                FROM clients
                WHERE YEAR(date_create) = YEAR(CURDATE())
                  AND MONTH(date_create) = MONTH(CURDATE())
            `),
            db.query(`
                SELECT COALESCE(SUM(total), 0) AS value
                FROM invoices_issued
                WHERE is_refund = FALSE
            `),
            db.query(`
                SELECT COUNT(*) AS value
                FROM invoices_issued
                WHERE collection_status = 'pending'
            `),
            db.query(`
                SELECT COUNT(*) AS value
                FROM estates
            `),
            db.query(`
                SELECT COUNT(*) AS value
                FROM employee
            `)
        ]);

        return {
            todayIncome: Number(todayIncomeRows[0].value),
            activeClients: Number(activeClientsRows[0].value),
            newClients: Number(newClientsRows[0].value),
            totalSales: Number(totalSalesRows[0].value),
            pendingInvoices: Number(pendingInvoicesRows[0].value),
            activeProperties: Number(activePropertiesRows[0].value),
            activeEmployees: Number(activeEmployeesRows[0].value)
        };
    }
}
