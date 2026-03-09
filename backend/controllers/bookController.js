const db = require('../config/db');

// Lấy danh sách sách có tìm kiếm và lọc
exports.getAllBooks = (req, res) => {
  const { search, category } = req.query;

  let sql = `
    SELECT b.id, b.title, b.description, b.price, b.stock, b.cover_image,
           c.name AS category_name, a.name AS author_name, p.name AS publisher_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN authors a ON b.author_id = a.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    WHERE 1=1
  `;

  const params = [];
  if (search) {
    sql += ` AND b.title LIKE ?`;
    params.push(`%${search}%`);
  }
  if (category) {
    sql += ` AND b.category_id = ?`;
    params.push(category);
  }

  sql += " ORDER BY b.id DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi server", error: err });
    res.json(results);
  });
};

// Lấy sách bán chạy
exports.getBestSellers = (req, res) => {
  const sql = `
    SELECT b.id, b.title, b.price, b.original_price, b.cover_image, b.author_id,
           a.name AS author_name, SUM(oi.quantity) AS total_sold
    FROM order_items oi
    JOIN books b ON oi.book_id = b.id
    LEFT JOIN authors a ON b.author_id = a.id
    GROUP BY b.id
    ORDER BY total_sold DESC LIMIT 10
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.json(results);
  });
};

// Lấy top giảm giá
exports.getTopDiscount = (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const sql = `
    SELECT id, title, cover_image, price, original_price,
           ROUND((original_price - price) / original_price * 100, 2) AS discount_percent
    FROM books WHERE original_price > price
    ORDER BY discount_percent DESC LIMIT ?
  `;

  db.query(sql, [limit], (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.json(results);
  });
};

// Chi tiết 1 cuốn sách
exports.getBookById = (req, res) => {
  const sql = `
    SELECT b.*, c.name AS category_name, a.name AS author_name, p.name AS publisher_name
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN authors a ON b.author_id = a.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    WHERE b.id = ?
  `;

  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (results.length === 0) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(results[0]);
  });
};