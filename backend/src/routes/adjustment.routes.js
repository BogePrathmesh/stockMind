import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getAdjustments,
  getAdjustment,
  createAdjustment
} from '../controllers/adjustment.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAdjustments);
router.get('/:id', getAdjustment);
router.post('/', createAdjustment);

export default router;



