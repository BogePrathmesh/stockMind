import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getBacktests,
  createBacktest,
  getBacktest,
  deleteBacktest
} from '../controllers/backtest.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getBacktests);
router.post('/', createBacktest);
router.get('/:id', getBacktest);
router.delete('/:id', deleteBacktest);

export default router;

