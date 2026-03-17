const db = require("../config/db");

exports.applyCoupon = (req, res) => {

  const { code, total } = req.body;

  const sql = `SELECT * FROM coupons WHERE code = ?`;

  db.query(sql, [code], (err, result) => {

    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length === 0)
      return res.json({ message: "Coupon không tồn tại" });

    const coupon = result[0];

    if (new Date(coupon.expiry_date) < new Date())
      return res.json({ message: "Coupon hết hạn" });

    if (total < coupon.min_order_value)
      return res.json({ message: "Đơn hàng chưa đủ điều kiện" });

    let discount = 0;

    if (coupon.discount_percent) {
      discount = (total * coupon.discount_percent) / 100;
    } else {
      discount = coupon.discount_amount;
    }

    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }

    res.json({
      discount,
      final_total: total - discount
    });

  });

};

exports.getAvailableCoupons = (req, res) => {
  const sql = `
    SELECT * FROM coupons
    WHERE expiry_date >= CURDATE()
    ORDER BY expiry_date ASC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.json(result);
  });
};