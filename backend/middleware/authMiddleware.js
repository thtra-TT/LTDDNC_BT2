const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

// 1. Middleware XÁC THỰC (Authentication)
// Nhiệm vụ: Kiểm tra token có hợp lệ không?
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Token thường có dạng "Bearer <token>"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token format invalid' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Lưu thông tin user (id, email, ROLE) vào request để dùng ở bước sau
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// 2. Middleware PHÂN QUYỀN (Authorization)
// Nhiệm vụ: Kiểm tra user có đúng role yêu cầu không?
const authorize = (roles = []) => {
    // Nếu truyền vào 1 string (vd: 'admin'), chuyển nó thành mảng ['admin']
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // req.user được tạo ra từ hàm authenticateToken bên trên
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Kiểm tra: Nếu role của user KHÔNG nằm trong danh sách cho phép
        if (roles.length && !roles.includes(req.user.role)) {
            // Trả về lỗi 403 Forbidden (Cấm truy cập)
            return res.status(403).json({ message: 'Forbidden: Bạn không đủ quyền truy cập' });
        }

        // Nếu đúng quyền --> Cho qua
        next();
    };
};

// Xuất cả 2 hàm ra để dùng
module.exports = {
    authenticateToken,
    authorize
};
