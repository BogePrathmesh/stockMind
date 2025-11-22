import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getPortfolio,
  addHolding,
  updateHolding,
  deleteHolding,
  getPortfolioHistory
} from '../controllers/portfolio.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getPortfolio);
router.post('/holdings', addHolding);
router.put('/holdings/:id', updateHolding);
router.delete('/holdings/:id', deleteHolding);
router.get('/history', getPortfolioHistory);

export default router;

