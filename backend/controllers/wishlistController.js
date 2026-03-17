const db = require("../config/db");

// helper query promise
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};


// ===========================
// Thêm sản phẩm vào wishlist
// ===========================
exports.addWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { book_id } = req.body;

    // 1. Kiểm tra tồn tại
    const existed = await query(
      "SELECT id FROM wishlist WHERE user_id = ? AND book_id = ?",
      [userId, book_id]
    );

    if (existed.length > 0) {
      return res.json({
        message: "Đã tồn tại trong yêu thích",
        wishlist_id: existed[0].id,
        book_id
      });
    }

    // 2. Chưa có → Insert
    const result = await query(
      "INSERT INTO wishlist (user_id, book_id) VALUES (?, ?)",
      [userId, book_id]
    );

    res.json({
      message: "Đã thêm vào sản phẩm yêu thích",
      wishlist_id: result.insertId,
      book_id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ===========================
// Xóa khỏi wishlist
// ===========================
exports.removeWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    await query(
      "DELETE FROM wishlist WHERE user_id = ? AND book_id = ?",
      [userId, bookId]
    );

    res.json({
      message: "Đã xóa khỏi yêu thích",
      book_id: bookId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ===========================
// Lấy danh sách wishlist
// ===========================
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const books = await query(
      `SELECT
         w.id AS wishlist_id,
         w.book_id,
         b.*
       FROM wishlist w
       JOIN books b ON w.book_id = b.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );

    res.json(books);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};