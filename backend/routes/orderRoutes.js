const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorize } = require("../middleware/authMiddleware");

// Sử dụng đúng cái tên đã import
router.use(authenticateToken);
// Định nghĩa route tạo đơn hàng
router.post('/create', orderController.createOrder);
router.get('/user/:userId', orderController.getOrders);
router.get('/order-detail/:orderId', orderController.getOrderDetail);
router.put('/cancel-order/:orderId', orderController.cancelOrder);
router.post("/calc-total", orderController.calcTotal);
module.exports = router;