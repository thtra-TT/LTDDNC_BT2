const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const { search, category } = req.query;

  let sql = `
    SELECT
      b.id, b.title, b.description, b.price, b.stock, b.cover_image,
      c.name AS category_name,
      a.name AS author_name,
      p.name AS publisher_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN authors a ON b.author_id = a.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    WHERE 1=1
  `;

  if (search) {
    sql += ` AND b.title LIKE '%${search}%'`;
  }

  if (category) {
    sql += ` AND b.category_id = ${category}`;
  }

  sql += " ORDER BY b.id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Query error:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const sql = `
    SELECT
      b.*, c.name AS category_name,
      a.name AS author_name,
      p.name AS publisher_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN authors a ON b.author_id = a.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    WHERE b.id = ?
  `;

  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });

    if (results.length === 0)
      return res.status(404).json({ message: "Không tìm thấy sách" });

    res.json(results[0]);
  });
});

module.exports = router;
