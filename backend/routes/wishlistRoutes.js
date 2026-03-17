const express = require("express");
const router = express.Router();

const wishlistController = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");

// thêm yêu thích
router.post("/", authMiddleware.authenticateToken, wishlistController.addWishlist);

// xóa yêu thích
router.delete("/:bookId", authMiddleware.authenticateToken, wishlistController.removeWishlist);

// lấy danh sách yêu thích
router.get("/", authMiddleware.authenticateToken, wishlistController.getWishlist);

module.exports = router;