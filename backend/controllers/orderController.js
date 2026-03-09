
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