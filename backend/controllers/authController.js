const bcrypt = require('bcrypt');
const User = require('../models/User');
const db = require('../config/db');
const { sendOTPEmail } = require('../config/email');
const { generateToken } = require('../config/jwt');
const helpers = require('../utils/authHelpers');

// Lưu trữ OTP tạm thời (Trong production nên dùng Redis)
const otpStore = {};

// --- REGISTER: SEND OTP ---
exports.sendRegisterOtp = async (req, res) => {
  const { email } = req.body;
  if (!email || !helpers.isValidEmail(email)) {
    return res.status(400).json({ message: 'Email không hợp lệ' });
  }

  User.findByEmail(email, async (err, user) => {
    if (err) return res.status(500).json({ message: 'Lỗi server' });
    if (user) return res.status(400).json({ message: 'Email đã được đăng ký' });

    const otp = helpers.generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000;
    otpStore[`register_${email}`] = { otp, expiryTime };

    const result = await sendOTPEmail(email, otp);
    if (!result.success) return res.status(500).json({ message: 'Không gửi được email OTP' });

    res.json({ message: 'OTP đã được gửi tới email' });
  });
};

// --- REGISTER: VERIFY & CREATE ---
exports.register = async (req, res) => {
  const { username, email, phone, password, otp } = req.body;
  const identifier = email || phone;
  const otpKey = `register_${identifier}`;
  const otpData = otpStore[otpKey];

  if (!otpData || Date.now() > otpData.expiryTime || otp !== otpData.otp) {
    return res.status(400).json({ message: 'OTP không hợp lệ hoặc hết hạn' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  User.create({
    username, email, phone,
    password: hashedPassword,
    role: email === 'admin@gmail.com' ? 'admin' : 'user'
  }, (err) => {
    if (err) return res.status(500).json({ message: 'Đăng ký thất bại' });
    delete otpStore[otpKey];
    res.json({ message: 'Đăng ký thành công' });
  });
};

// --- LOGIN ---
exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findByEmail(email, async (err, user) => {
    if (err || !user) return res.status(401).json({ message: 'Tài khoản không tồn tại' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Sai mật khẩu' });

    const token = generateToken(user);
    res.json({ message: 'Login success', token, user });
  });
};

// --- FORGOT PASSWORD: SEND OTP ---
exports.sendForgotPassOtp = async (req, res) => {
  const { email, phone } = req.body;
  const identifier = email || phone;
  if (!identifier) return res.status(400).json({ message: 'Thiếu thông tin' });

  User.findByEmail(identifier, async (err, user) => { // Giả sử findByEmail tìm được cả 2 hoặc dùng hàm riêng
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const otp = helpers.generateOTP();
    otpStore[identifier] = { otp, expiryTime: Date.now() + 10 * 60 * 1000 };

    if (email) await sendOTPEmail(email, otp);
    else helpers.sendOTPPhone(phone, otp);

    res.json({ message: 'Mã OTP đã được gửi' });
  });
};

// --- FORGOT PASSWORD: RESET ---
exports.resetPassword = async (req, res) => {
  const { email, phone, otp, newPassword } = req.body;
  const identifier = email || phone;
  const otpData = otpStore[identifier];

  if (!otpData || otp !== otpData.otp || Date.now() > otpData.expiryTime) {
    return res.status(400).json({ message: 'OTP không hợp lệ' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const sql = email ? 'UPDATE users SET password = ? WHERE email = ?' : 'UPDATE users SET password = ? WHERE phone = ?';

  db.query(sql, [hashedPassword, identifier], (err) => {
    if (err) return res.status(500).json({ message: 'Lỗi cập nhật' });
    delete otpStore[identifier];
    res.json({ message: 'Đặt lại mật khẩu thành công' });
  });
};