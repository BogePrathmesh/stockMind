import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getDeliveries,
  getDelivery,
  createDelivery,
  updateDelivery,
  validateDelivery,
  generateDeliveryPDFRoute
} from '../controllers/delivery.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDeliveries);
router.get('/:id', getDelivery);
router.get('/:id/pdf', generateDeliveryPDFRoute);
router.post('/', createDelivery);
router.put('/:id', updateDelivery);
router.post('/:id/validate', validateDelivery);

export default router;



