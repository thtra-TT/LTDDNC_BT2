const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Định nghĩa đường dẫn
router.get("/", categoryController.getAllCategories);

module.exports = router;