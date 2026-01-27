const rateLimit = require('express-rate-limit');

// Gửi OTP (register / forgot password) → chống spam
const sendOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 3, // tối đa 3 lần
  message: {
    status: 429,
    message: 'Bạn gửi OTP quá nhiều lần, vui lòng thử lại sau 5 phút',
  },
});

// Xác minh OTP + đăng ký
const verifyOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: 'Xác minh OTP quá nhiều lần',
  },
});

// Login → chống brute-force
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 5,
  message: {
    status: 429,
    message: 'Đăng nhập quá nhiều lần, vui lòng thử lại sau 1 phút',
  },
});

// Reset password
const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: {
    status: 429,
    message: 'Đặt lại mật khẩu quá nhiều lần',
  },
});

module.exports = {
  sendOtpLimiter,
  verifyOtpLimiter,
  loginLimiter,
  resetPasswordLimiter,
};
