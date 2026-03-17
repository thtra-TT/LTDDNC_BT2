const express = require("express");
const router = express.Router();

const pointController = require("../controllers/pointController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, pointController.getPoints);

router.post("/use", authenticateToken, pointController.usePoints);

module.exports = router;