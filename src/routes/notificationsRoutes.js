import express from 'express';
import NotificationsController from '../controllers/notificationsController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/', auth, NotificationsController.getNotifications);
router.patch('/:id/read', auth, NotificationsController.markAsRead);

export default router;
