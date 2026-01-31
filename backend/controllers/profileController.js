//const bcrypt = require("bcryptjs");
//const User = require("../models/User");
//const sendMail = require("../config/email");
//
///*
//  ==========================================
//  PROFILE CONTROLLER
//  ==========================================
//  Bao gồm:
//  - Lấy thông tin user
//  - Cập nhật avatar
//  - Cập nhật họ tên, địa chỉ
//  - Đổi số điện thoại
//  - Gửi OTP xác nhận email
//  - Verify OTP & đổi email
//  - Đổi mật khẩu
//*/
//
//// Lấy thông tin user theo token
////exports.getProfile = (req, res) => {
////  const userId = req.user.id;
////
////  User.findById(userId, (err, user) => {
////    if (err) return res.status(500).json({ message: "Lỗi server" });
////    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
////
////    res.json(user);
////  });
////};
//exports.getProfile = (req, res) => {
//  User.findById(req.user.id, (err, user) => {
//    if (err) return res.status(500).json({ message: "Lỗi server" });
//    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
//
//    res.json({
//      id: user.id,
//      username: user.username,
//      email: user.email,
//      full_name: user.full_name,
//      address: user.address,
//      phone: user.phone,
//      avatar: user.avatar ? `${process.env.BASE_URL}/uploads/${user.avatar}` : null
//    });
//  });
//};
//
//// Cập nhật avatar
////exports.updateAvatar = (req, res) => {
////  const userId = req.user.id;
////  const { avatar } = req.body;
////
////  if (!avatar)
////    return res.status(400).json({ message: "Thiếu avatar" });
////
////  User.updateAvatar(userId, avatar, (err) => {
////    if (err) return res.status(500).json({ message: "Lỗi server" });
////
////    res.json({ message: "Cập nhật avatar thành công", avatar });
////  });
////};
//exports.updateAvatar = (req, res) => {
//  const userId = req.user.id;
//
//  if (!req.file)
//    return res.status(400).json({ message: "Không có file upload" });
//
//  const avatarFile = req.file.filename;
//
//  User.updateAvatar(userId, avatarFile, (err) => {
//    if (err) return res.status(500).json({ message: "Lỗi server" });
//
//    res.json({
//      message: "Cập nhật avatar thành công",
//      avatar_url: `${process.env.BASE_URL}/uploads/${avatarFile}`
//    });
//  });
//};
//
//// Cập nhật tên + địa chỉ
//exports.updateInfo = (req, res) => {
//  const userId = req.user.id;
//  const { full_name, address } = req.body;
//
//  User.updateInfo(userId, full_name, address, (err) => {
//    if (err) return res.status(500).json({ message: "Lỗi server" });
//
//    res.json({ message: "Cập nhật thông tin thành công" });
//  });
//};
//
//// Cập nhật số điện thoại
//exports.updatePhone = (req, res) => {
//  const userId = req.user.id;
//  const { phone } = req.body;
//
//  User.updatePhone(userId, phone, (err) => {
//    if (err) return res.status(500).json({ message: "Lỗi server" });
//
//    res.json({ message: "Cập nhật số điện thoại thành công" });
//  });
//};
//
//// Gửi OTP để đổi email
//exports.sendOTP = (req, res) => {
//  const userId = req.user.id;
//  const { new_email } = req.body;
//
//  const otp = Math.floor(100000 + Math.random() * 900000); // 6 số
//
//  User.saveOTP(userId, otp, async (err) => {
//    if (err) return res.status(500).json({ message: "Lỗi server" });
//
//    // Gửi email
//    await sendMail(
//      new_email,
//      "Xác nhận đổi email",
//      `Mã OTP của bạn là: <b>${otp}</b>`
//    );
//
//    res.json({
//      message: "OTP đã được gửi đến email mới",
//      email_send_to: new_email,
//    });
//  });
//};
//
//// Xác thực OTP và đổi email
//exports.verifyOTP = (req, res) => {
//  const userId = req.user.id;
//  const { otp, new_email } = req.body;
//
//  const sql = "SELECT otp FROM users WHERE id=?";
//  require("../db").query(sql, [userId], (err, rows) => {
//    if (err) return res.status(500).json({ message: "Lỗi server" });
//
//    if (!rows[0] || rows[0].otp != otp) {
//      return res.status(400).json({ message: "OTP không hợp lệ" });
//    }
//
//    // OTP đúng → cập nhật email
//    User.updateEmail(userId, new_email, (err) => {
//      if (err) return res.status(500).json({ message: "Không thể cập nhật email" });
//
//      res.json({ message: "Đổi email thành công", new_email });
//    });
//  });
//};
//
//// Đổi mật khẩu
//exports.changePassword = (req, res) => {
//  const userId = req.user.id;
//  const { old_password, new_password } = req.body;
//
//  // Lấy mật khẩu cũ từ DB
//  User.getPassword(userId, async (err, hashedPassword) => {
//    if (err) return res.status(500).json({ message: "Lỗi server" });
//    if (!hashedPassword) return res.status(404).json({ message: "Không tìm thấy user" });
//
//    // So sánh mật khẩu cũ
//    const isMatch = await bcrypt.compare(old_password, hashedPassword);
//
//    if (!isMatch)
//      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
//
//    // Hash mật khẩu mới
//    const newHashed = await bcrypt.hash(new_password, 10);
//
//    User.updatePassword(userId, newHashed, (err) => {
//      if (err) return res.status(500).json({ message: "Không thể cập nhật mật khẩu" });
//
//      res.json({ message: "Đổi mật khẩu thành công" });
//    });
//  });
//};

const bcrypt = require("bcryptjs");
const User = require("../models/User");
const sendMail = require("../config/email");
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

    res.json({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar
        ? `${process.env.BASE_URL}/uploads/${user.avatar}`
        : null,
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
      avatar_url: `${process.env.BASE_URL}/uploads/${avatarFile}`
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
exports.sendOTP = (req, res) => {
  const userId = req.user.id;
  const { new_email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);

  User.saveOTP(userId, otp, async (err) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });

    await sendMail(new_email, "Xác nhận đổi email", `Mã OTP: <b>${otp}</b>`);

    res.json({
      message: "OTP đã gửi",
      send_to: new_email
    });
  });
};


/// Xác minh OTP → đổi email
exports.verifyOTP = (req, res) => {
  const userId = req.user.id;
  const { otp, new_email } = req.body;

  const sql = "SELECT otp FROM users WHERE id=?";
  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });

    if (!rows[0] || rows[0].otp != otp) {
      return res.status(400).json({ message: "OTP không hợp lệ" });
    }

    User.updateEmail(userId, new_email, (err) => {
      if (err) return res.status(500).json({ message: "Không thể cập nhật email" });

      res.json({
        message: "Đổi email thành công",
        new_email
      });
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
