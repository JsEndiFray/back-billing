import db from '../db/dbConnect.js';

/**
 * Repositorio de notificaciones.
 * Las notificaciones son computadas desde datos existentes.
 * El estado "leído" se persiste en notification_reads.
 */
export default class NotificationsRepository {

    static async initTable() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS notification_reads (
                id              INT AUTO_INCREMENT PRIMARY KEY,
                user_id         INT NOT NULL,
                notification_id INT NOT NULL,
                read_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_read (user_id, notification_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
    }

    static async getComputedNotifications(userId) {
        await this.initTable();

        const [
            [pendingRows],
            [overdueRows],
            [newClientsRows],
            [readRows]
        ] = await Promise.all([
            db.query(`SELECT COUNT(*) AS count FROM invoices_issued WHERE collection_status = 'pending'`),
            db.query(`SELECT COUNT(*) AS count FROM invoices_issued WHERE collection_status = 'overdue'`),
            db.query(`SELECT COUNT(*) AS count FROM clients WHERE date_create >= DATE_SUB(NOW(), INTERVAL 7 DAY)`),
            db.query(`SELECT notification_id FROM notification_reads WHERE user_id = ?`, [userId])
        ]);

        const readIds = new Set(readRows.map(r => r.notification_id));
        const now = new Date().toISOString();
        const notifications = [];

        if (pendingRows[0].count > 0) {
            notifications.push({
                id: 1,
                message: `${pendingRows[0].count} factura(s) pendientes de cobro`,
                type: 'warning',
                read: readIds.has(1),
                createdAt: now
            });
        }

        if (overdueRows[0].count > 0) {
            notifications.push({
                id: 2,
                message: `${overdueRows[0].count} factura(s) con pago vencido`,
                type: 'warning',
                read: readIds.has(2),
                createdAt: now
            });
        }

        if (newClientsRows[0].count > 0) {
            notifications.push({
                id: 3,
                message: `${newClientsRows[0].count} nuevo(s) cliente(s) esta semana`,
                type: 'success',
                read: readIds.has(3),
                createdAt: now
            });
        }

        return notifications;
    }

    static async markAsRead(userId, notificationId) {
        await this.initTable();
        await db.query(
            'INSERT IGNORE INTO notification_reads (user_id, notification_id) VALUES (?, ?)',
            [userId, notificationId]
        );
    }
}
