import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert
} from '../controllers/alert.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

export default router;

