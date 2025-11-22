import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  predictStock,
  getStockForecast
} from '../controllers/ai.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/predict', predictStock);
router.get('/forecast', getStockForecast);

export default router;






