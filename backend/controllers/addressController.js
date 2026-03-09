const db = require('../config/db');

// 1. LẤY DANH SÁCH
exports.getUserAddresses = (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY is_default DESC";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// 2. THÊM MỚI
exports.addAddress = (req, res) => {
  // Nhận userId từ req.body (phải khớp với key gửi từ Frontend)
  const { userId, recipient_name, phone_number, province, district, ward, specific_address, is_default } = req.body;

  // Kiểm tra định dạng số điện thoại ở server (Lớp bảo vệ thứ 2)
  const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).json({ message: "Số điện thoại không đúng định dạng Việt Nam" });
  }

  // Kiểm tra thiếu userId
  if (!userId) {
    return res.status(400).json({ message: "Thiếu thông tin người dùng" });
  }

  const save = () => {
    const sql = `INSERT INTO shipping_addresses (user_id, recipient_name, phone_number, province, district, ward, specific_address, is_default) VALUES (?,?,?,?,?,?,?,?)`;
    // Chuyển is_default sang 1 hoặc 0 cho MySQL
    const values = [userId, recipient_name, phone_number, province, district, ward, specific_address, is_default ? 1 : 0];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Lỗi MySQL:", err);
        return res.status(500).json({ error: "Lỗi cơ sở dữ liệu" });
      }
      res.json({ message: "Thêm thành công", addressId: result.insertId });
    });
  };

  // Nếu đặt làm mặc định, phải bỏ mặc định của các địa chỉ cũ của user đó
  if (is_default) {
    db.query("UPDATE shipping_addresses SET is_default = 0 WHERE user_id = ?", [userId], (err) => {
      if (err) return res.status(500).json({ error: err });
      save();
    });
  } else {
    save();
  }
};

// 3. CẬP NHẬT
exports.updateAddress = (req, res) => {
  const { id } = req.params;
  const { userId, recipient_name, phone_number, province, district, ward, specific_address, is_default } = req.body;

  const performUpdate = () => {
    const sql = `UPDATE shipping_addresses SET recipient_name=?, phone_number=?, province=?, district=?, ward=?, specific_address=?, is_default=? WHERE id=? AND user_id=?`;
    db.query(sql, [recipient_name, phone_number, province, district, ward, specific_address, is_default ? 1 : 0, id, userId], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Cập nhật thành công" });
    });
  };

  if (is_default) {
    db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [userId], performUpdate);
  } else {
    performUpdate();
  }
};

// 4. XÓA
exports.deleteAddress = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM shipping_addresses WHERE id = ? AND is_default = 0", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(400).json({ message: "Không thể xóa địa chỉ mặc định" });
    res.json({ message: "Xóa thành công" });
  });
};

exports.getDefaultAddress = (req, res) => {
    const userId = req.params.userId;

    const query = 'SELECT * FROM shipping_addresses WHERE user_id = ? AND is_default = 1 LIMIT 1';

    // Dùng db.query hoặc db.execute trực tiếp với callback
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Lỗi SQL:", err);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }

        // Với callback, results chính là mảng chứa dữ liệu (rows)
        if (results && results.length > 0) {
            res.json(results[0]);
        } else {
            res.json(null);
        }
    });
};

exports.getAllAddressesByUser = (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC';

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Lỗi SQL dòng 118:", err);
            return res.status(500).json({ message: "Lỗi tải danh sách địa chỉ" });
        }

        // results ở đây đã là một mảng (Array), không cần destructuring [rows]
        res.json(results);
    });
};