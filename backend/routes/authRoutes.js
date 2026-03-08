const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  sendOtpLimiter,
  verifyOtpLimiter,
  loginLimiter,
  resetPasswordLimiter,
} = require('../middleware/rateLimit');

// Register
router.post('/register/send-otp', sendOtpLimiter, authController.sendRegisterOtp);
router.post('/register', verifyOtpLimiter, authController.register);

// Login
router.post('/login', loginLimiter, authController.login);

// Forgot Password
router.post('/forgot-password/send-otp', sendOtpLimiter, authController.sendForgotPassOtp);
router.post('/forgot-password/reset-password', resetPasswordLimiter, authController.resetPassword);

module.exports = router;