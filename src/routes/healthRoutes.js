import express from 'express';
import HealthController from '../controllers/healthController.js';

const router = express.Router();

router.get('/', HealthController.check);

export default router;
