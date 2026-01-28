const { users } = require('../models/User');

const jwt = require('jsonwebtoken');


const db = require('../db');

// Secret Key (Nên giống với bên middleware)
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Tìm user
    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    // --- ĐOẠN DEBUG (MÁY SOI) BẮT ĐẦU ---
    console.log("========== BẮT ĐẦU DEBUG ==========");
    console.log("1. Email khách gửi lên:", email);
    console.log("2. Pass khách nhập:", `"${password}"`); // Để trong ngoặc kép để soi khoảng trắng

    if (user) {
        console.log("3. Pass lấy từ DB ra:", `"${user.password}"`); // Soi xem DB đang lưu cái gì
        console.log("4. So sánh:", user.password === password ? "GIỐNG NHAU" : "KHÁC NHAU");
        console.log("5. Độ dài:", `Khách(${password.length}) - DB(${user.password.length})`);
    } else {
        console.log("3. Lỗi: Không tìm thấy user trong DB!");
    }
    console.log("========== KẾT THÚC DEBUG ==========");
    // --- HẾT ĐOẠN DEBUG ---

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    // Nếu pass đúng thì tạo token
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '1h' }
    );


    res.json({
      message: 'Login success',
      token: token,
      user: { id: user.id, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};


exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Thiếu thông tin: username, email, password' });
  }

  try {
    // 1. Kiểm tra xem email đã tồn tại trong DB chưa
    const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email này đã được đăng ký' });
    }

    // 2. Logic cấp quyền Admin (Hack tạm thời)
    // Nếu email là admin@gmail.com thì lưu role = 'admin', ngược lại là 'user'
    const role = (email === 'admin@gmail.com') ? 'admin' : 'user';

    // 3. Insert user mới vào MySQL
    await db.promise().query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role]
    );

    res.json({ message: 'Đăng ký thành công', role: role });

  } catch (err) {
    console.error("Lỗi Register:", err);
    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
};