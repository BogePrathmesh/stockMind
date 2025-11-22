import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  signup,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  refreshToken
} from '../controllers/auth.controller.js';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many attempts, please try again later'
});

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // 1 request per minute
  message: 'Please wait before requesting another OTP'
});

router.post('/signup', signup);
router.post('/login', authLimiter, login);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

export default router;



