const express = require("express");
const router = express.Router();

const { authenticateToken, authorize } = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");
const upload = require("../middleware/upload");   // ⬅ Multer upload (bắt buộc để đổi avatar)


/* ============================
    API DEMO CŨ (GIỮ NGUYÊN)
=============================== */

router.get("/profile-basic", authenticateToken, (req, res) => {
  res.json({
    message: "Đây là profile của bạn (API cũ)",
    user: req.user,
  });
});

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
      PROFILE API MỚI
=============================== */

// Lấy thông tin profile đầy đủ
router.get("/profile", authenticateToken, profileController.getProfile);

// Cập nhật avatar (có multer)
router.put(
  "/profile/avatar",
  authenticateToken,
  upload.single("avatar"),  // ⬅ BẮT BUỘC
  profileController.updateAvatar
);

// Cập nhật họ tên + địa chỉ + sdt
router.put("/profile/info", authenticateToken, profileController.updateInfo);

// Gửi OTP để đổi email
router.post("/profile/send-otp", authenticateToken, profileController.sendOTP);

// Xác minh OTP & đổi email
router.post("/profile/verify-otp", authenticateToken, profileController.verifyOTP);

// Đổi mật khẩu
router.put("/profile/change-password", authenticateToken, profileController.changePassword);

module.exports = router;
