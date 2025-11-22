import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from '../controllers/warehouse.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getWarehouses);
router.get('/:id', getWarehouse);
router.post('/', createWarehouse);
router.put('/:id', updateWarehouse);
router.delete('/:id', deleteWarehouse);

export default router;






