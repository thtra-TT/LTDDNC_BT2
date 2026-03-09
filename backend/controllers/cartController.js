// controllers/cartController.js
const db = require('../config/db');

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = (req, res) => {
    const { userId, bookId, quantity } = req.body;

    // 1. Kiểm tra tồn kho của sách
    const checkStockSql = 'SELECT stock, title FROM books WHERE id = ?';
    db.query(checkStockSql, [bookId], (err, books) => {
        if (err) return res.status(500).json({ error: err.message });

        const book = books[0];
        if (!book || book.stock <= 0) {
            return res.status(400).json({ message: "Sản phẩm đã hết hàng!" });
        }
        if (book.stock < quantity) {
            return res.status(400).json({ message: `Chỉ còn ${book.stock} sản phẩm trong kho.` });
        }

        // 2. Tìm hoặc tạo Giỏ hàng (Cart) cho User
        const findCartSql = 'SELECT id FROM carts WHERE user_id = ?';
        db.query(findCartSql, [userId], (err, carts) => {
            if (err) return res.status(500).json({ error: err.message });

            const proceedWithCartItem = (cartId) => {
                // 3. Kiểm tra sản phẩm đã có trong giỏ chưa
                const checkItemSql = 'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND book_id = ?';
                db.query(checkItemSql, [cartId, bookId], (err, items) => {
                    if (err) return res.status(500).json({ error: err.message });

                    if (items.length > 0) {
                        // Cập nhật số lượng nếu đã tồn tại
                        const newQty = items[0].quantity + quantity;
                        if (newQty > book.stock) {
                            return res.status(400).json({ message: "Vượt quá số lượng trong kho!" });
                        }
                        const updateItemSql = 'UPDATE cart_items SET quantity = ? WHERE id = ?';
                        db.query(updateItemSql, [newQty, items[0].id], (err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            res.status(200).json({ message: "Cập nhật giỏ hàng thành công!" });
                        });
                    } else {
                        // Thêm mới nếu chưa có
                        const insertItemSql = 'INSERT INTO cart_items (cart_id, book_id, quantity) VALUES (?, ?, ?)';
                        db.query(insertItemSql, [cartId, bookId, quantity], (err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            res.status(200).json({ message: "Thêm vào giỏ hàng thành công!" });
                        });
                    }
                });
            };

            if (carts.length === 0) {
                // Tạo giỏ hàng mới
                const createCartSql = 'INSERT INTO carts (user_id) VALUES (?)';
                db.query(createCartSql, [userId], (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    proceedWithCartItem(result.insertId);
                });
            } else {
                proceedWithCartItem(carts[0].id);
            }
        });
    });
};

// Lấy danh sách sản phẩm trong giỏ hàng
exports.getCart = (req, res) => {
  // Lấy userId từ params (hoặc từ req.user.id nếu bạn dùng middleware auth)
  const userId = req.params.userId;

  const sql = `
    SELECT
        ci.id,
        b.id AS book_id,
        b.title,
        b.price,
        b.stock,
        b.cover_image,
        ci.quantity
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.id
    JOIN books b ON ci.book_id = b.id
    WHERE c.user_id = ?`;

  db.query(sql, [userId], (err, results) => {
    // 1. Kiểm tra lỗi Server
    if (err) {
      return res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng", error: err });
    }

    // 2. Trả về kết quả (trả về mảng rỗng [] nếu giỏ hàng không có gì)
    // Phong cách giống getProfile: trả trực tiếp kết quả hoặc mảng map dữ liệu
    res.json(results);
  });
};

exports.updateCartQuantity = (req, res) => {
    const { cartItemId, quantity } = req.body;

    if (quantity < 1) {
        return res.status(400).json({ message: "Số lượng không thể nhỏ hơn 1" });
    }

    // Kiểm tra tồn kho trước khi cập nhật
    const sqlCheckStock = `
        SELECT b.stock
        FROM cart_items ci
        JOIN books b ON ci.book_id = b.id
        WHERE ci.id = ?`;

    db.query(sqlCheckStock, [cartItemId], (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi server", error: err });
        if (results.length === 0) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

        if (results[0].stock < quantity) {
            return res.status(400).json({ message: `Sách này chỉ còn ${results[0].stock} sản phẩm` });
        }

        const sqlUpdate = "UPDATE cart_items SET quantity = ? WHERE id = ?";
        db.query(sqlUpdate, [quantity, cartItemId], (err) => {
            if (err) return res.status(500).json({ message: "Lỗi khi cập nhật", error: err });
            res.json({ message: "Cập nhật thành công" });
        });
    });
};

exports.removeCartItem = (req, res) => {
    const { cartItemId } = req.params;
    const sql = "DELETE FROM cart_items WHERE id = ?";

    db.query(sql, [cartItemId], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi server", error: err });
        res.json({ message: "Đã xóa sản phẩm khỏi giỏ hàng" });
    });
};
