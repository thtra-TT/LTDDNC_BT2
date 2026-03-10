const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

// Đổi tên từ authMiddleware thành authenticateToken cho khớp với file gốc
const { authenticateToken } = require('../middleware/authMiddleware');

// Sử dụng đúng cái tên đã import
router.use(authenticateToken);
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