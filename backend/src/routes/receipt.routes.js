import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getReceipts,
  getReceipt,
  createReceipt,
  updateReceipt,
  validateReceipt,
  generateReceiptPDFRoute
} from '../controllers/receipt.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getReceipts);
router.get('/:id', getReceipt);
router.get('/:id/pdf', generateReceiptPDFRoute);
router.post('/', createReceipt);
router.put('/:id', updateReceipt);
router.post('/:id/validate', validateReceipt);

export default router;



