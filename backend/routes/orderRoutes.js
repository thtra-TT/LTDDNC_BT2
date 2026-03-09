const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Định nghĩa route tạo đơn hàng
router.post('/create', orderController.createOrder);

module.exports = router;