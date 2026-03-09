const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Định nghĩa route tạo đơn hàng
router.post('/create', orderController.createOrder);
router.get('/user/:userId', orderController.getOrders);
router.get('/order-detail/:orderId', orderController.getOrderDetail);
router.put('/cancel-order/:orderId', orderController.cancelOrder);
module.exports = router;