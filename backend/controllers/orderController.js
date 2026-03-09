
const db = require('../config/db');

exports.createOrder = (req, res) => {
    const { user_id, shipping_address_id, items, total_price, payment_method } = req.body;

    if (!user_id || !items || items.length === 0) {
        return res.status(400).json({ error: "Dữ liệu không đầy đủ" });
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: "Lỗi Transaction" });

        // 1. Chèn đơn hàng
        const orderSql = `INSERT INTO orders (user_id, shipping_address_id, total, status, payment_method)
                          VALUES (?, ?, ?, 'pending', ?)`;

        db.query(orderSql, [user_id, shipping_address_id, total_price, payment_method], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi lưu Order" }));

            const orderId = result.insertId;
            let processed = 0;

            // Hàm xử lý từng món hàng
            const processItem = (index) => {
                if (index === items.length) {
                    return db.commit((err) => {
                        if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi Commit" }));
                        res.json({ success: true, orderId });
                    });
                }

                const item = items[index];
                // 2. Chèn Order Items
                const itemSql = `INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)`;
                db.query(itemSql, [orderId, item.book_id, item.quantity, item.price], (err) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi lưu Item" }));

                    // 3. Trừ kho
                    const stockSql = `UPDATE books SET stock = stock - ? WHERE id = ? AND stock >= ?`;
                    db.query(stockSql, [item.quantity, item.book_id, item.quantity], (err, stockRes) => {
                        if (err || stockRes.affectedRows === 0) {
                            return db.rollback(() => res.status(400).json({ error: `Sách ID ${item.book_id} hết hàng` }));
                        }

                        // 4. Xóa giỏ hàng
                        const delCartSql = `DELETE FROM cart_items WHERE id = ?`;
                        console.log(item.cart_item_id),
                        db.query(delCartSql, [item.cart_item_id], (err) => {
                            if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi xóa giỏ" }));
                            processItem(index + 1);
                        });
                    });
                });
            };
            processItem(0);
        });
    });
};

// 1. Lấy danh sách đơn hàng của user
exports.getOrders = (req, res) => {
  const { userId } = req.params;

  // Kiểm tra nếu userId không tồn tại
  if (!userId) {
    return res.status(400).json({ error: "Thiếu ID người dùng" });
  }

  const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Lỗi SQL getOrders:", err);
      return res.status(500).json({ error: "Lỗi cơ sở dữ liệu" });
    }
    // Trả về mảng rỗng [] nếu không có đơn hàng thay vì báo lỗi
    res.json(results || []);
  });
};

exports.getOrderDetail = (req, res) => {
  const { orderId } = req.params;

  const sql = `
    SELECT
      o.id AS order_id,
      o.total,
      o.status,
      o.created_at,
      u.full_name AS customer_name,
      sa.recipient_name,
      sa.phone_number,
      sa.specific_address,
      sa.ward,
      sa.district,
      sa.province,
      oi.book_id,
      oi.quantity,
      oi.price AS unit_price,
      b.title AS book_title,
      b.cover_image
    FROM auth_app.orders o
    JOIN auth_app.users u ON o.user_id = u.id
    LEFT JOIN auth_app.shipping_addresses sa ON o.shipping_address_id = sa.id
    JOIN auth_app.order_items oi ON o.id = oi.order_id
    LEFT JOIN auth_app.books b ON oi.book_id = b.id
    WHERE o.id = ?`;

  db.query(sql, [orderId], (err, results) => {
    if (err) {
      console.error("Lỗi SQL:", err.sqlMessage);
      return res.status(500).json({ error: "Lỗi truy vấn chi tiết" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    // Gom nhóm dữ liệu: Thông tin chung đơn hàng + mảng các sản phẩm
    const orderInfo = {
      order_id: results[0].order_id,
      customer_name: results[0].customer_name,
      phone: results[0].phone_number,
      address: `${results[0].specific_address}, ${results[0].ward}, ${results[0].district}, ${results[0].province}`,
      total: results[0].total,
      status: results[0].status,
      created_at: results[0].created_at,
      items: results.map(row => ({
        book_id: row.book_id,
        title: row.book_title,
        quantity: row.quantity,
        price: row.unit_price,
        cover_image: row.cover_image
      }))
    };

    res.json(orderInfo);
  });
};

exports.cancelOrder = (req, res) => {
  const { orderId } = req.params;

  // 1. Lấy thời gian tạo đơn hàng
  const sqlGetOrder = "SELECT created_at, status FROM auth_app.orders WHERE id = ?";

  db.query(sqlGetOrder, [orderId], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

    const order = results[0];
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const diffInMinutes = (now - createdAt) / (1000 * 60); // Tính số phút chênh lệch

    // 2. Kiểm tra điều kiện: trong vòng 30p và chưa bị huỷ/hoàn thành
    if (diffInMinutes > 30) {
      return res.status(400).json({ error: "Đã quá 30 phút, bạn không thể huỷ đơn hàng này." });
    }

    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ error: "Trạng thái hiện tại không cho phép huỷ." });
    }

    // 3. Tiến hành cập nhật trạng thái
    const sqlUpdate = "UPDATE auth_app.orders SET status = 'cancelled' WHERE id = ?";
    db.query(sqlUpdate, [orderId], (err, result) => {
      if (err) return res.status(500).json({ error: "Lỗi khi huỷ đơn hàng" });
      res.json({ message: "Huỷ đơn hàng thành công" });
    });
  });
};

