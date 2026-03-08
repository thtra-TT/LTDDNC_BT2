const db = require('../db');

// Lấy tất cả danh mục
exports.getAllCategories = (req, res) => {
  const sql = "SELECT * FROM categories";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Lỗi lấy danh mục:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(results);
  });
};