import db from '../db/dbConnect.js';

/**
 * Repositorio de notificaciones.
 * Las notificaciones son computadas desde datos existentes.
 * El estado "leído" se persiste en notification_reads (requiere CREATE TABLE manual).
 * Si la tabla no existe, todas las notificaciones aparecen como no leídas.
 */
export default class NotificationsRepository {

    static async getComputedNotifications(userId) {
        const [
            [pendingRows],
            [overdueRows],
            [newClientsRows]
        ] = await Promise.all([
            db.query(`SELECT COUNT(*) AS count FROM invoices_issued WHERE collection_status = 'pending'`),
            db.query(`SELECT COUNT(*) AS count FROM invoices_issued WHERE collection_status = 'overdue'`),
            db.query(`SELECT COUNT(*) AS count FROM clients WHERE date_create >= DATE_SUB(NOW(), INTERVAL 7 DAY)`)
        ]);

        let readIds = new Set();
        try {
            const [readRows] = await db.query(
                `SELECT notification_id FROM notification_reads WHERE user_id = ?`,
                [userId]
            );
            readIds = new Set(readRows.map(r => r.notification_id));
        } catch {
            // notification_reads no existe — tratar todas como no leídas
        }

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
        try {
            await db.query(
                'INSERT IGNORE INTO notification_reads (user_id, notification_id) VALUES (?, ?)',
                [userId, notificationId]
            );
        } catch {
            // notification_reads no existe — ignorar (ejecutar migración para activar esta función)
        }
    }
}
