import db from '../db/dbConnect.js';

/**
 * Tipos de notificación — fuente de verdad del backend.
 * El frontend mapea estos tipos a rutas/iconos/etc.
 */
export const NOTIFICATION_TYPES = Object.freeze({
    PENDING_INVOICES: 'pending_invoices',
    OVERDUE_INVOICES: 'overdue_invoices',
    NEW_CLIENTS:      'new_clients',
});

/**
 * Repositorio de notificaciones computadas.
 * Devuelve datos puros: tipo, mensaje y metadata.
 * NO incluye lógica de presentación ni rutas de frontend.
 *
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
                type: NOTIFICATION_TYPES.PENDING_INVOICES,
                message: `${pendingRows[0].count} factura(s) pendientes de cobro`,
                read: readIds.has(1),
                createdAt: now,
                metadata: { count: pendingRows[0].count }
            });
        }

        if (overdueRows[0].count > 0) {
            notifications.push({
                id: 2,
                type: NOTIFICATION_TYPES.OVERDUE_INVOICES,
                message: `${overdueRows[0].count} factura(s) con pago vencido`,
                read: readIds.has(2),
                createdAt: now,
                metadata: { count: overdueRows[0].count }
            });
        }

        if (newClientsRows[0].count > 0) {
            notifications.push({
                id: 3,
                type: NOTIFICATION_TYPES.NEW_CLIENTS,
                message: `${newClientsRows[0].count} nuevo(s) cliente(s) esta semana`,
                read: readIds.has(3),
                createdAt: now,
                metadata: { count: newClientsRows[0].count }
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
