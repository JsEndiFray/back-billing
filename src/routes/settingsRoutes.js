import express from 'express';
import SettingsController from '../controllers/settingsController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/', auth, SettingsController.getSettings);
router.put('/', auth, SettingsController.updateSettings);

export default router;
