import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { chatMessage } from '../controllers/chatbot.controller.js';

const router = express.Router();

router.use(authenticate);

router.post('/message', chatMessage);

export default router;

