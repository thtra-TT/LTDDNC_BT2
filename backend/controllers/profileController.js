const bcrypt = require("bcryptjs");
const User = require("../models/User");
//const sendMail = require("../config/email");
const { sendOTPEmail } = require("../config/email");
const db = require("../db");

/*
  ============================
  PROFILE CONTROLLER
  ============================
*/

/// Lấy thông tin từ token
exports.getProfile = (req, res) => {
  User.findById(req.user.id, (err, user) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    console.log("USER:", user);           // 👈 XEM USER Ở ĐÂY
    console.log("Avatar path:", user.avatar);

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


/// Cập nhật avatar
exports.updateAvatar = (req, res) => {
  const userId = req.user.id;

  if (!req.file)
    return res.status(400).json({ message: "Không có file upload" });

  const avatarFile = req.file.filename;

  User.updateAvatar(userId, avatarFile, (err) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });

    res.json({
      message: "Cập nhật avatar thành công",
      avatar: avatarFile      // chỉ trả về tên file
    });
  });
};


/// Cập nhật họ tên + địa chỉ
exports.updateInfo = (req, res) => {
  const userId = req.user.id;
  const { full_name, address, phone } = req.body;
  if (phone && !/^[0-9]{10}$/.test(phone)) {
    return res.status(400).json({
      message: "Số điện thoại không hợp lệ! Phải đúng 10 số."
    });
  }
  const sql = `
    UPDATE users
    SET full_name=?, address=?, phone=?
    WHERE id=?
  `;

  db.query(sql, [full_name, address, phone, userId], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Lỗi server" });
    }

    res.json({ message: "Cập nhật thành công!" });
  });
};




/// Gửi OTP xác nhận email
exports.sendOTP = async (req, res) => {
  const { new_email } = req.body;

  if (!new_email)
    return res.status(400).json({ message: "Thiếu email mới" });

  // Validate format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(new_email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  // Tạo OTP dạng string 6 số
  const otp = String(Math.floor(100000 + Math.random() * 900000));

  try {
    const result = await sendOTPEmail(new_email, otp);

    if (!result.success) {
      return res.status(500).json({ message: "Không thể gửi email" });
    }

    // Trả OTP về client (giống lúc đăng ký)
    res.json({
      message: "Đã gửi OTP!",
      otp: otp,
      email: new_email
    });

  } catch (err) {
    console.log("Lỗi gửi mail:", err);
    res.status(500).json({ message: "Lỗi server khi gửi OTP" });
  }
};


/// Xác minh OTP → đổi email
// =========================
// XÁC MINH OTP & ĐỔI EMAIL
// =========================
// =========================
// XÁC MINH OTP & ĐỔI EMAIL (ĐÃ SỬA)
// =========================
exports.verifyOTP = (req, res) => {
  const userId = req.user.id;
  const { otp_client, otp_server, new_email } = req.body;

  if (!otp_client)
    return res.status(400).json({ message: "Thiếu OTP từ client" });

  if (!otp_server)
    return res.status(400).json({ message: "Thiếu OTP từ server" });

  if (!new_email)
    return res.status(400).json({ message: "Thiếu email mới" });

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(new_email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  // So sánh OTP
  if (String(otp_client).trim() !== String(otp_server).trim()) {
    return res.status(400).json({ message: "OTP không đúng" });
  }

  // OTP đúng → đổi email
  const sql = "UPDATE users SET email=? WHERE id=?";

  db.query(sql, [new_email, userId], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Không thể đổi email" });
    }

    res.json({
      message: "Đổi email thành công!",
      new_email
    });
  });
};


/// Đổi mật khẩu
exports.changePassword = (req, res) => {
  const userId = req.user.id;
  const { old_password, new_password } = req.body;

  User.getPassword(userId, async (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!hashedPassword) return res.status(404).json({ message: "Không tìm thấy user" });

    const isMatch = await bcrypt.compare(old_password, hashedPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

    const newHashed = await bcrypt.hash(new_password, 10);

    User.updatePassword(userId, newHashed, (err) => {
      if (err) return res.status(500).json({ message: "Không thể cập nhật mật khẩu" });

      res.json({ message: "Đổi mật khẩu thành công" });
    });
  });
};
