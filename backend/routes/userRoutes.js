//const express = require('express');
//const router = express.Router();
//// Import từ file bạn vừa sửa
//const { authenticateToken, authorize } = require('../middleware/authMiddleware');
//
//// API: Ai đăng nhập rồi cũng xem được (User & Admin)
//router.get('/profile', authenticateToken, (req, res) => {
//    res.json({ message: "Đây là profile của bạn", user: req.user });
//});
//
//// API: Chỉ ADMIN mới được xóa user
//// Cú pháp: authenticateToken -> authorize('admin')
//router.delete('/users/:id', authenticateToken, authorize('admin'), (req, res) => {
//    res.json({ message: "Đã xóa user thành công (Chỉ Admin mới thấy dòng này)" });
//});
//
//module.exports = router;

const express = require("express");
const router = express.Router();

const { authenticateToken, authorize } = require("../middleware/authMiddleware");

// Import Profile Controller
const profileController = require("../controllers/profileController");

/* ============================
    ROUTES CŨ (GIỮ NGUYÊN)
=============================== */

// Ai đăng nhập cũng dùng được
router.get("/profile-basic", authenticateToken, (req, res) => {
  res.json({
    message: "Đây là profile của bạn (API cũ)",
    user: req.user,
  });
});

// Chỉ admin mới được xóa user
router.delete(
  "/users/:id",
  authenticateToken,
  authorize("admin"),
  (req, res) => {
    res.json({
      message: "Đã xóa user thành công (API cũ - chỉ Admin)",
    });
  }
);

/* ============================
    PROFILE API MỚI (BỔ SUNG)
=============================== */

// Lấy thông tin profile chi tiết
router.get("/profile", authenticateToken, profileController.getProfile);

// Cập nhật avatar
router.put("/profile/avatar", authenticateToken, profileController.updateAvatar);

// Cập nhật họ tên + địa chỉ
router.put("/profile/info", authenticateToken, profileController.updateInfo);

// Cập nhật số điện thoại
router.put("/profile/phone", authenticateToken, profileController.updatePhone);

// Gửi OTP đổi email
router.post("/profile/send-otp", authenticateToken, profileController.sendOTP);

// Xác thực OTP và đổi email
router.post("/profile/verify-otp", authenticateToken, profileController.verifyOTP);

// Đổi mật khẩu
router.put("/profile/change-password", authenticateToken, profileController.changePassword);

module.exports = router;
