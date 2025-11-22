import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getTransfers,
  getTransfer,
  createTransfer,
  updateTransfer,
  validateTransfer,
  generateTransferPDFRoute
} from '../controllers/transfer.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTransfers);
router.get('/:id', getTransfer);
router.get('/:id/pdf', generateTransferPDFRoute);
router.post('/', createTransfer);
router.put('/:id', updateTransfer);
router.post('/:id/validate', validateTransfer);

export default router;



