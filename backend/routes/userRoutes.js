const express = require('express');
const router = express.Router();
// Import từ file bạn vừa sửa
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// API: Ai đăng nhập rồi cũng xem được (User & Admin)
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: "Đây là profile của bạn", user: req.user });
});

// API: Chỉ ADMIN mới được xóa user
// Cú pháp: authenticateToken -> authorize('admin')
router.delete('/users/:id', authenticateToken, authorize('admin'), (req, res) => {
    res.json({ message: "Đã xóa user thành công (Chỉ Admin mới thấy dòng này)" });
});

module.exports = router;