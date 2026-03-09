const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendOTPEmail } = require("../config/email");
const db = require('../config/db');

// Lấy thông tin người dùng
exports.getProfile = (req, res) => {
  User.findById(req.user.id, (err, user) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    res.json({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      role: user.role,
      created_at: user.created_at
    });
  });
};

// Cập nhật Avatar
exports.updateAvatar = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Không có file upload" });

  const userId = req.user.id;
  const avatarFile = req.file.filename;

  User.updateAvatar(userId, avatarFile, (err) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.json({ message: "Cập nhật avatar thành công", avatar: avatarFile });
  });
};

// Cập nhật Thông tin cá nhân
exports.updateInfo = (req, res) => {
  const userId = req.user.id;
  const { full_name, address, phone } = req.body;

  if (phone && !/^[0-9]{10}$/.test(phone)) {
    return res.status(400).json({ message: "Số điện thoại không hợp lệ!" });
  }

  const sql = "UPDATE users SET full_name=?, address=?, phone=? WHERE id=?";
  db.query(sql, [full_name, address, phone, userId], (err) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.json({ message: "Cập nhật thành công!" });
  });
};

// Gửi OTP đổi email
exports.sendOTP = async (req, res) => {
  const { new_email } = req.body;
  if (!new_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(new_email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  try {
    const result = await sendOTPEmail(new_email, otp);
    if (!result.success) return res.status(500).json({ message: "Không thể gửi mail" });
    res.json({ message: "Đã gửi OTP!", otp, email: new_email });
  } catch (err) {
    res.status(500).json({ message: "Lỗi gửi mail" });
  }
};

// Xác minh OTP & Cập nhật email
exports.verifyOTP = (req, res) => {
  const userId = req.user.id;
  const { otp_client, otp_server, new_email } = req.body;

  if (String(otp_client).trim() !== String(otp_server).trim()) {
    return res.status(400).json({ message: "OTP không đúng" });
  }

  const sql = "UPDATE users SET email=? WHERE id=?";
  db.query(sql, [new_email, userId], (err) => {
    if (err) return res.status(500).json({ message: "Không thể đổi email" });
    res.json({ message: "Đổi email thành công!", new_email });
  });
};

// Đổi mật khẩu
exports.changePassword = (req, res) => {
  const userId = req.user.id;
  const { old_password, new_password } = req.body;

  User.getPassword(userId, async (err, hashedPassword) => {
    if (err || !hashedPassword) return res.status(500).json({ message: "Lỗi xác thực" });

    const isMatch = await bcrypt.compare(old_password, hashedPassword);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

    const newHashed = await bcrypt.hash(new_password, 10);
    User.updatePassword(userId, newHashed, (err) => {
      if (err) return res.status(500).json({ message: "Lỗi cập nhật mật khẩu" });
      res.json({ message: "Đổi mật khẩu thành công" });
    });
  });
};