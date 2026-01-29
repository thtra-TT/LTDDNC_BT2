//const db = require('../db');
//
///*
//  =========================
//  Model User
//  =========================
//
//  File này dùng để:
//  - Làm việc trực tiếp với bảng `users` trong MySQL
//  - Không xử lý logic (login, register)
//  - Chỉ làm nhiệm vụ: TRUY VẤN DATABASE
//
//  Các chức năng chính:
//  1. Tìm user theo email (dùng khi đăng nhập)
//  2. Tạo user mới (dùng khi đăng ký)
//
//  Bảng `users` gồm các cột:
//  - id (INT, AUTO_INCREMENT, PRIMARY KEY)
//  - username (VARCHAR)
//  - email (VARCHAR)
//  - password (VARCHAR – đã mã hóa bcrypt)
//*/
//
//const User = {
//  /**
//   * Tìm user theo email
//   * @param {string} email
//   * @param {function} callback
//   */
//  findByEmail: (email, callback) => {
//    const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
//    db.query(sql, [email], (err, results) => {
//      if (err) return callback(err, null);
//      callback(null, results[0]); // trả về 1 user
//    });
//  },
//
//  /**
//   * Tạo user mới
//   * @param {object} user
//   * @param {function} callback
//   */
////  create: (user, callback) => {
////    const sql = `
////      INSERT INTO users (username, email, password, role)
////      VALUES (?, ?, ?, ?)
////    `;
////    db.query(
////      sql,
////      [user.username, user.email, user.password],
////      callback
////    );
////  }
//
//    create: (user, callback) => {
//      const sql = `
//        INSERT INTO users (username, email, password, role)
//        VALUES (?, ?, ?, ?)
//      `;
//      db.query(
//        sql,
//        [user.username, user.email, user.password, user.role || 'user'],
//        callback
//      );
//    }
//
//};
//
//module.exports = User;


const db = require('../db');

/*
  =========================
  Model User (MySQL)
  =========================

  File này chỉ làm nhiệm vụ TRUY VẤN DATABASE.
  Không xử lý logic — Logic xử lý được viết trong Controller.

  Bảng users gồm:
  id, username, full_name, email, password,
  phone, address, avatar, role, created_at, updated_at
*/

const User = {

  /** =============================
   *  TÌM USER THEO EMAIL (LOGIN)
   * ============================= */
  findByEmail: (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ? LIMIT 1";
    db.query(sql, [email], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results[0]);
    });
  },

  /** =============================
   *  TÌM USER THEO ID (PROFILE)
   * ============================= */
  findById: (id, callback) => {
    const sql = `
      SELECT id, username, full_name, email, phone, address, avatar, role, created_at
      FROM users WHERE id = ? LIMIT 1
    `;
    db.query(sql, [id], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results[0]);
    });
  },

  /** =============================
   *  ĐĂNG KÝ TÀI KHOẢN
   * ============================= */
  create: (user, callback) => {
    const sql = `
      INSERT INTO users (username, full_name, email, password, phone, address, avatar, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [
        user.username,
        user.full_name || null,
        user.email,
        user.password,
        user.phone || null,
        user.address || null,
        user.avatar || null,
        user.role || 'user'
      ],
      callback
    );
  },

  /** =============================
   *  CẬP NHẬT AVATAR
   * ============================= */
  updateAvatar: (id, avatar, callback) => {
    const sql = "UPDATE users SET avatar=? WHERE id=?";
    db.query(sql, [avatar, id], callback);
  },

  /** =============================
   *  CẬP NHẬT THÔNG TIN CƠ BẢN
   * ============================= */
  updateInfo: (id, full_name, address, callback) => {
    const sql = `
      UPDATE users
      SET full_name=?, address=?
      WHERE id=?
    `;
    db.query(sql, [full_name, address, id], callback);
  },

  /** =============================
   *  CẬP NHẬT SỐ ĐIỆN THOẠI
   * ============================= */
  updatePhone: (id, phone, callback) => {
    const sql = "UPDATE users SET phone=? WHERE id=?";
    db.query(sql, [phone, id], callback);
  },

  /** =============================
   *  LƯU OTP VÀO DATABASE
   * ============================= */
  saveOTP: (id, otp, callback) => {
    const sql = "UPDATE users SET otp=? WHERE id=?";
    db.query(sql, [otp, id], callback);
  },

  /** =============================
   *  CẬP NHẬT EMAIL SAU KHI VERIFY OTP
   * ============================= */
  updateEmail: (id, new_email, callback) => {
    const sql = "UPDATE users SET email=?, otp=NULL WHERE id=?";
    db.query(sql, [new_email, id], callback);
  },

  /** =============================
   *  LẤY MẬT KHẨU ĐỂ KIỂM TRA
   * ============================= */
  getPassword: (id, callback) => {
    const sql = "SELECT password FROM users WHERE id=?";
    db.query(sql, [id], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results[0]?.password);
    });
  },

  /** =============================
   *  CẬP NHẬT MẬT KHẨU MỚI
   * ============================= */
  updatePassword: (id, hashedPassword, callback) => {
    const sql = "UPDATE users SET password=? WHERE id=?";
    db.query(sql, [hashedPassword, id], callback);
  },
};

module.exports = User;
