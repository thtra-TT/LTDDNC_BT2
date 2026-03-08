const express = require("express");
const router = express.Router();

const { authenticateToken, authorize } = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");
const upload = require("../middleware/upload");

// --- PROFILE API ---

// Lấy thông tin profile đầy đủ
router.get("/profile", authenticateToken, profileController.getProfile);

// Cập nhật avatar (cần multer để xử lý file)
router.put("/profile/avatar", authenticateToken, upload.single("avatar"), profileController.updateAvatar);

// Cập nhật thông tin cơ bản (họ tên, địa chỉ, sdt)
router.put("/profile/info", authenticateToken, profileController.updateInfo);

// Đổi email (Gửi OTP & Xác nhận)
router.post("/profile/send-otp", authenticateToken, profileController.sendOTP);
router.post("/profile/verify-otp", authenticateToken, profileController.verifyOTP);

// Đổi mật khẩu
router.put("/profile/change-password", authenticateToken, profileController.changePassword);

// --- API DEMO/CŨ ---
router.get("/profile-basic", authenticateToken, (req, res) => {
  res.json({ message: "Profile basic", user: req.user });
});

router.delete("/users/:id", authenticateToken, authorize("admin"), (req, res) => {
  res.json({ message: "Đã xóa user thành công (chỉ Admin)" });
});

module.exports = router;