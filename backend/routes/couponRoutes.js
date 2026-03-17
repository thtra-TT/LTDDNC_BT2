const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const couponController = require("../controllers/couponController");

// Áp dụng mã giảm giá
router.post("/apply", authenticateToken, couponController.applyCoupon);

// Lấy danh sách coupon còn hạn
router.get(
  "/available/:userId",
  authenticateToken,
  couponController.getAvailableCoupons
);

module.exports = router;