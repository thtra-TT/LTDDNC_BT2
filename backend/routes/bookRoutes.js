const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

// Định nghĩa các route và trỏ về controller tương ứng
router.get("/", bookController.getAllBooks);
router.get("/best-sellers", bookController.getBestSellers);
router.get("/top-discount", bookController.getTopDiscount);
router.get("/:id", bookController.getBookById);
router.get("/:id/similar", bookController.getSimilarBooks);
router.get("/:id/stats", bookController.getBookStats);

module.exports = router;