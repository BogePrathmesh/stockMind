import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import {
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/profile.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getProfile);
router.put('/', upload.single('profileImage'), updateProfile);
router.post('/change-password', changePassword);

export default router;



