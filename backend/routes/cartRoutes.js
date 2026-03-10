// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken, authorize } = require("../middleware/authMiddleware");

// Sử dụng đúng cái tên đã import
router.use(authenticateToken);

// Định nghĩa route
router.post('/add', cartController.addToCart);
router.get('/:userId',authenticateToken, cartController.getCart);
router.put('/update-quantity', cartController.updateCartQuantity);
router.delete('/remove/:cartItemId', cartController.removeCartItem);
module.exports = router;