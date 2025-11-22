import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getStockSentiment,
  getSentimentHistory
} from '../controllers/sentiment.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/:symbol', getStockSentiment);
router.get('/:symbol/history', getSentimentHistory);

export default router;

