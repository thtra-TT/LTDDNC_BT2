const db = require("../config/db");
const crypto = require("crypto");

// Helper: chuyển db.query thành Promise để dùng async/await
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// CREATE REVIEW
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { book_id, order_id, rating, comment } = req.body;

    // 1. check order completed
    const order = await query(
      `SELECT * FROM orders
       WHERE id = ? AND user_id = ? AND status = 'success'`,
      [order_id, userId]
    );

    if (order.length === 0) {
      return res.status(400).json({
        message: "Bạn chỉ được đánh giá đơn hàng đã hoàn thành",
      });
    }

    // 2. check book thuộc order
    const item = await query(
      `SELECT * FROM order_items
       WHERE order_id = ? AND book_id = ?`,
      [order_id, book_id]
    );

    if (item.length === 0) {
      return res.status(400).json({
        message: "Sản phẩm không nằm trong đơn hàng",
      });
    }

    // 3. check đã review chưa
    const exist = await query(
      `SELECT * FROM reviews
       WHERE user_id = ? AND book_id = ? AND order_id = ?`,
      [userId, book_id, order_id]
    );

    if (exist.length > 0) {
      return res.status(400).json({
        message: "Bạn đã đánh giá sản phẩm này rồi",
      });
    }

    // 4. insert review
    await query(
      `INSERT INTO reviews (user_id, book_id, order_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, book_id, order_id, rating, comment]
    );

    // 5. random reward
    const rewardType = Math.random() < 0.5 ? "points" : "coupon";

    let reward = {};

    if (rewardType === "points") {
      const points = 10;

      await query(
        `UPDATE users SET reward_points = reward_points + ? WHERE id = ?`,
        [points, userId]
      );

      await query(
        `INSERT INTO reward_points (user_id, points, reason)
         VALUES (?, ?, ?)`,
        [userId, points, "Review sản phẩm"]
      );

      reward = {
        type: "points",
        value: points,
      };

    } else {

      const code =
        "SALE" + crypto.randomBytes(3).toString("hex").toUpperCase();

      await query(
        `INSERT INTO coupons (code, discount_percent, user_id, expiry_date)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
        [code, 10, userId]
      );

      reward = {
        type: "coupon",
        code,
        discount: 10,
      };
    }

    res.json({
      message: "Đánh giá thành công",
      reward,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};


// GET REVIEWS BY BOOK
exports.getReviewsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await query(
      `SELECT r.*, u.full_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.book_id = ?
       ORDER BY r.created_at DESC`,
      [bookId]
    );

    res.json(reviews);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

