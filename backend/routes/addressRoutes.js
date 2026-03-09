const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

// Giả định bạn đã có middleware xác thực để lấy req.user.id
const { authMiddleware } = require('../middleware/authMiddleware');

// Lấy theo userId truyền vào URL giống cart/:userId
router.get('/:userId', addressController.getUserAddresses);
router.post('/', addressController.addAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
// Route lấy địa chỉ mặc định
router.get('/default/:userId', addressController.getDefaultAddress);

// Route lấy tất cả địa chỉ của 1 user
router.get('/user/:userId', addressController.getAllAddressesByUser);
module.exports = router;