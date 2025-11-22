import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getStockMovements,
  getStockMovement
} from '../controllers/ledger.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getStockMovements);
router.get('/:id', getStockMovement);

export default router;



