import NotificationsServices from '../services/notificationsServices.js';

export default class NotificationsController {

    static async getNotifications(req, res, next) {
        try {
            const notifications = await NotificationsServices.getNotifications(req.user.id);
            return res.status(200).json({ success: true, data: notifications });
        } catch (error) {
            next(error);
        }
    }

    static async markAsRead(req, res, next) {
        try {
            await NotificationsServices.markAsRead(req.user.id, req.params.id);
            return res.status(200).json({ success: true, data: { marked: true } });
        } catch (error) {
            next(error);
        }
    }
}
