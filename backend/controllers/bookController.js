const db = require('../config/db');
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
// Lấy danh sách sách có tìm kiếm và lọc
exports.getAllBooks = (req, res) => {
  const { search, category, page = 1, limit = 20 } = req.query;

  const offset = (page - 1) * limit;

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
    sql += " AND b.title LIKE ?";
    params.push(`%${search}%`);
  }

  if (category) {
    sql += " AND b.category_id = ?";
    params.push(category);
  }

  sql += " ORDER BY b.id DESC LIMIT ? OFFSET ?";
  params.push(Number(limit), Number(offset));

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

//// Chi tiết 1 cuốn sách
//exports.getBookById = (req, res) => {
//  const sql = `
//    SELECT b.*, c.name AS category_name, a.name AS author_name, p.name AS publisher_name
//    FROM books b
//    LEFT JOIN categories c ON b.category_id = c.id
//    LEFT JOIN authors a ON b.author_id = a.id
//    LEFT JOIN publishers p ON b.publisher_id = p.id
//    WHERE b.id = ?
//  `;
//
//  db.query(sql, [req.params.id], (err, results) => {
//    if (err) return res.status(500).json({ message: "Lỗi server" });
//    if (results.length === 0) return res.status(404).json({ message: "Không tìm thấy" });
//    res.json(results[0]);
//  });
//};

exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin sách
    const [book] = await query(`
      SELECT b.*, c.name AS category_name, a.name AS author_name, p.name AS publisher_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN publishers p ON b.publisher_id = p.id
      WHERE b.id = ?
    `, [id]);

    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });

    // Đếm số người mua
    const [buyers] = await query(`
      SELECT COUNT(DISTINCT o.user_id) AS buyersCount
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
      WHERE oi.book_id = ?
    `, [id]);

    // Đếm số người đánh giá
    const [reviews] = await query(`
      SELECT COUNT(*) AS reviewsCount
      FROM reviews
      WHERE book_id = ?
    `, [id]);

    res.json({
      ...book,
      buyersCount: buyers.buyersCount,
      reviewsCount: reviews.reviewsCount
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


exports.getSimilarBooks = async (req, res) => {

  try {

    const { id } = req.params;

    // lấy category của sách hiện tại
    const book = await query(
      "SELECT category_id FROM books WHERE id = ?",
      [id]
    );

    if (book.length === 0) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    const categoryId = book[0].category_id;

    // lấy sách cùng category
    const books = await query(
      `SELECT *
       FROM books
       WHERE category_id = ?
       AND id != ?
       LIMIT 10`,
      [categoryId, id]
    );

    res.json(books);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error"
    });

  }

};


exports.getBookStats = (req, res) => {

  const { id } = req.params;

  const sql = `
    SELECT
        COUNT(DISTINCT o.user_id) AS buyers,
        COUNT(DISTINCT r.user_id) AS reviewers,
        AVG(r.rating) AS avg_rating
    FROM books b
    LEFT JOIN order_items oi ON b.id = oi.book_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
    LEFT JOIN reviews r ON b.id = r.book_id
    WHERE b.id = ?
  `;

  db.query(sql, [id], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(result[0]);

  });

};
