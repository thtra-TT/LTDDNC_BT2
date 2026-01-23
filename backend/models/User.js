const db = require('../db');

/*
  =========================
  Model User
  =========================

  File này dùng để:
  - Làm việc trực tiếp với bảng `users` trong MySQL
  - Không xử lý logic (login, register)
  - Chỉ làm nhiệm vụ: TRUY VẤN DATABASE

  Các chức năng chính:
  1. Tìm user theo email (dùng khi đăng nhập)
  2. Tạo user mới (dùng khi đăng ký)

  Bảng `users` gồm các cột:
  - id (INT, AUTO_INCREMENT, PRIMARY KEY)
  - username (VARCHAR)
  - email (VARCHAR)
  - password (VARCHAR – đã mã hóa bcrypt)
*/

const User = {
  /**
   * Tìm user theo email
   * @param {string} email
   * @param {function} callback
   */
  findByEmail: (email, callback) => {
    const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    db.query(sql, [email], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results[0]); // trả về 1 user
    });
  },

  /**
   * Tạo user mới
   * @param {object} user
   * @param {function} callback
   */
  create: (user, callback) => {
    const sql = `
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
    `;
    db.query(
      sql,
      [user.username, user.email, user.password],
      callback
    );
  }
};

module.exports = User;
