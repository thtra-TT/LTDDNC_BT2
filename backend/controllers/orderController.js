const db = require('../config/db');

exports.createOrder = (req, res) => {

    const {
        user_id,
        shipping_address_id,
        items,
        total_price,
        payment_method,
        used_points,
        discount_coupon,
    } = req.body;

    if (!user_id || !items || items.length === 0) {
        return res.status(400).json({ error: "Dữ liệu không đầy đủ" });
    }

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: "Lỗi Transaction" });

        const processOrder = () => {

            // 1️⃣ Tạo Order
            db.query(
                `INSERT INTO orders (user_id, shipping_address_id, total, status, payment_method)
                 VALUES (?, ?, ?, 'pending', ?)`,
                [user_id, shipping_address_id, total_price, payment_method],
                (err, result) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi lưu Order" }));

                    const orderId = result.insertId;

                    const processItem = (index) => {

                        // Xong hết items → commit
                        if (index === items.length) {
                            return db.commit((err) => {
                                if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi Commit" }));

                                // 5️⃣ Điểm tích lũy từ đơn hàng: 1 điểm / 10.000đ
                                const earnedPoints = Math.floor(total_price / 10000);

                                db.query(
                                    `UPDATE users SET reward_points = reward_points + ? WHERE id = ?`,
                                    [earnedPoints, user_id]
                                );
                                db.query(
                                    `INSERT INTO point_transactions(user_id, reward_points, type) VALUES (?, ?, 'earn')`,
                                    [user_id, earnedPoints]
                                );

                                // 6️⃣ Đếm số đơn của user → đơn lẻ = điểm, đơn chẵn = coupon
                                db.query(
                                    `SELECT COUNT(*) AS cnt FROM orders WHERE user_id = ? AND status != 'cancelled'`,
                                    [user_id],
                                    (countErr, countRows) => {
                                        const orderCount = countRows?.[0]?.cnt || 1;
                                        const giveCoupon = (orderCount % 2 === 0); // chẵn → coupon, lẻ → điểm

                                        if (!giveCoupon) {
                                            // ── Tặng điểm bonus: 10 / 20 / 30 / 40 / 50 điểm ──
                                            const bonusPoints = (Math.floor(Math.random() * 5) + 1) * 10;

                                            db.query(
                                                `UPDATE users SET reward_points = reward_points + ? WHERE id = ?`,
                                                [bonusPoints, user_id]
                                            );
                                            db.query(
                                                `INSERT INTO point_transactions(user_id, reward_points, type) VALUES (?, ?, 'bonus')`,
                                                [user_id, bonusPoints]
                                            );

                                            return res.json({
                                                success:       true,
                                                orderId,
                                                earned_points: earnedPoints + bonusPoints,
                                                bonus_points:  bonusPoints,
                                            });

                                        } else {
                                            // ── Tặng coupon: giảm 5% / 10% / 15% ngẫu nhiên ──
                                            const pctOptions = [5, 10, 15];
                                            const pct        = pctOptions[Math.floor(Math.random() * pctOptions.length)];
                                            const couponCode = `GIFT${user_id}_${Date.now()}`;

                                            db.query(
                                                `INSERT INTO coupons (code, discount_percent, expiry_date, min_order_value)
                                                 VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), 0)`,
                                                [couponCode, pct],
                                                (insertErr) => {
                                                    if (insertErr) console.error("Lỗi tạo coupon:", insertErr);

                                                    return res.json({
                                                        success:               true,
                                                        orderId,
                                                        earned_points:         earnedPoints,
                                                        reward_coupon:         couponCode,
                                                        reward_coupon_percent: pct,
                                                    });
                                                }
                                            );
                                        }
                                    }
                                );
                            });
                        }

                        const item = items[index];

                        // 2️⃣ Lưu Order Item
                        db.query(
                            `INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)`,
                            [orderId, item.book_id, item.quantity, item.price],
                            (err) => {
                                if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi lưu Item" }));

                                // 3️⃣ Trừ kho
                                db.query(
                                    `UPDATE books SET stock = stock - ? WHERE id = ? AND stock >= ?`,
                                    [item.quantity, item.book_id, item.quantity],
                                    (err, stockRes) => {
                                        if (err || stockRes.affectedRows === 0) {
                                            return db.rollback(() =>
                                                res.status(400).json({ error: `Sách ID ${item.book_id} hết hàng` })
                                            );
                                        }

                                        // 4️⃣ Xóa cart item
                                        db.query(
                                            `DELETE FROM cart_items WHERE id = ?`,
                                            [item.cart_item_id],
                                            (err) => {
                                                if (err) return db.rollback(() => res.status(500).json({ error: "Lỗi xóa giỏ" }));
                                                processItem(index + 1);
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    };

                    processItem(0);
                }
            );
        };

        // 0️⃣ Trừ điểm nếu user dùng điểm
        if (used_points && used_points > 0) {
            db.query(
                `UPDATE users SET reward_points = reward_points - ? WHERE id = ? AND reward_points >= ?`,
                [used_points, user_id, used_points],
                (err, result) => {
                    if (err || result.affectedRows === 0) {
                        return db.rollback(() => res.status(400).json({ error: "Không đủ điểm để sử dụng" }));
                    }
                    db.query(
                        `INSERT INTO point_transactions(user_id, reward_points, type) VALUES (?, ?, 'redeem')`,
                        [user_id, -used_points]
                    );
                    processOrder();
                }
            );
        } else {
            processOrder();
        }
    });
};


// Lấy danh sách đơn hàng
exports.getOrders = (req, res) => {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "Thiếu ID người dùng" });

    db.query(
        `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
        [userId],
        (err, results) => {
            if (err) { console.error("Lỗi SQL getOrders:", err); return res.status(500).json({ error: "Lỗi cơ sở dữ liệu" }); }
            res.json(results || []);
        }
    );
};


// Chi tiết đơn hàng
exports.getOrderDetail = (req, res) => {
    const { orderId } = req.params;

    db.query(`
        SELECT
          o.id AS order_id, o.total, o.status, o.created_at,
          u.full_name AS customer_name,
          sa.recipient_name, sa.phone_number, sa.specific_address, sa.ward, sa.district, sa.province,
          oi.book_id, oi.quantity, oi.price AS unit_price,
          b.title AS book_title, b.cover_image
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN shipping_addresses sa ON o.shipping_address_id = sa.id
        JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN books b ON oi.book_id = b.id
        WHERE o.id = ?`,
        [orderId],
        (err, results) => {
            if (err) { console.error("Lỗi SQL:", err.sqlMessage); return res.status(500).json({ error: "Lỗi truy vấn chi tiết" }); }
            if (results.length === 0) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

            res.json({
                order_id:      results[0].order_id,
                customer_name: results[0].customer_name,
                phone:         results[0].phone_number,
                address:       `${results[0].specific_address}, ${results[0].ward}, ${results[0].district}, ${results[0].province}`,
                total:         results[0].total,
                status:        results[0].status,
                created_at:    results[0].created_at,
                items: results.map(row => ({
                    book_id:     row.book_id,
                    title:       row.book_title,
                    quantity:    row.quantity,
                    price:       row.unit_price,
                    cover_image: row.cover_image,
                }))
            });
        }
    );
};


// Huỷ đơn hàng
exports.cancelOrder = (req, res) => {
    const { orderId } = req.params;

    db.query(`SELECT created_at, status FROM orders WHERE id = ?`, [orderId], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

        const { created_at, status } = results[0];
        const diffMins = (new Date() - new Date(created_at)) / 60000;

        if (diffMins > 30) return res.status(400).json({ error: "Đã quá 30 phút, bạn không thể huỷ đơn hàng này." });
        if (status !== 'pending' && status !== 'processing') return res.status(400).json({ error: "Trạng thái hiện tại không cho phép huỷ." });

        db.query(`UPDATE orders SET status = 'cancelled' WHERE id = ?`, [orderId], (err) => {
            if (err) return res.status(500).json({ error: "Lỗi khi huỷ đơn hàng" });
            res.json({ message: "Huỷ đơn hàng thành công" });
        });
    });
};


// Tính tổng tiền — dùng db.promise() để tránh lỗi mysql2 await
exports.calcTotal = async (req, res) => {
    try {
        const { user_id, total, coupon_code, used_points } = req.body;

        let discountCoupon = 0;
        let discountPoints = 0;

        if (coupon_code) {
            const [rows] = await db.promise().query(`SELECT * FROM coupons WHERE code = ?`, [coupon_code]);
            if (rows.length === 0) return res.json({ success: false, error: "Coupon không tồn tại" });

            const coupon = rows[0];
            if (new Date(coupon.expiry_date) < new Date()) return res.json({ success: false, error: "Coupon hết hạn" });
            if (total < coupon.min_order_value) return res.json({ success: false, error: "Đơn hàng chưa đủ điều kiện" });

            discountCoupon = coupon.discount_percent
                ? (total * coupon.discount_percent) / 100
                : coupon.discount_amount;

            if (coupon.max_discount && discountCoupon > coupon.max_discount) discountCoupon = coupon.max_discount;
        }

        if (used_points > 0) {
            const [u] = await db.promise().query(`SELECT reward_points FROM users WHERE id = ?`, [user_id]);
            if (used_points > u[0].reward_points) return res.json({ success: false, error: "Không đủ điểm!" });
            discountPoints = used_points * 1000;
        }

        const finalTotal = Math.max(0, total - discountCoupon - discountPoints);
        res.json({ success: true, discount_coupon: discountCoupon, discount_points: discountPoints, final_total: finalTotal });

    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: "Server error" });
    }
};