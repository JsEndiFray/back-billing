import NotificationsRepository from '../repository/notificationsRepository.js';

export default class NotificationsServices {

    static async getNotifications(userId) {
        return await NotificationsRepository.getComputedNotifications(userId);
    }

    static async markAsRead(userId, notificationId) {
        await NotificationsRepository.markAsRead(userId, Number(notificationId));
    }
}
