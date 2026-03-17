// services/recentlyViewed.ts
// Lưu & đọc danh sách sách đã xem gần đây bằng SQLite (expo-sqlite v2 sync API)

import db from "./database"; // dùng đúng file database.ts đã có

// ─── Khởi tạo bảng (gọi 1 lần khi app start) ────────────────────────────────
export function initRecentlyViewedTable() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS recently_viewed (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id       INTEGER NOT NULL UNIQUE,
      title         TEXT,
      author_name   TEXT,
      cover_image   TEXT,
      price         REAL,
      original_price REAL,
      viewed_at     INTEGER NOT NULL
    );
  `);
}

// ─── Lưu một sách vào lịch sử xem ───────────────────────────────────────────
// Nếu đã tồn tại thì cập nhật viewed_at (UPSERT)
export function saveRecentlyViewed(book: {
  id: number;
  title: string;
  author_name?: string;
  cover_image?: string;
  price?: number;
  original_price?: number;
}) {
  const now = Date.now();
  db.runSync(
    `INSERT INTO recently_viewed
       (book_id, title, author_name, cover_image, price, original_price, viewed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(book_id) DO UPDATE SET
       title          = excluded.title,
       author_name    = excluded.author_name,
       cover_image    = excluded.cover_image,
       price          = excluded.price,
       original_price = excluded.original_price,
       viewed_at      = excluded.viewed_at`,
    [
      book.id,
      book.title ?? "",
      book.author_name ?? "",
      book.cover_image ?? "",
      book.price ?? 0,
      book.original_price ?? 0,
      now,
    ]
  );

  // Giữ tối đa 20 mục gần nhất — xóa cũ hơn
  db.runSync(
    `DELETE FROM recently_viewed
     WHERE id NOT IN (
       SELECT id FROM recently_viewed
       ORDER BY viewed_at DESC
       LIMIT 20
     )`
  );
}

// ─── Đọc danh sách đã xem (mới nhất trước) ───────────────────────────────────
export function getRecentlyViewed(limit = 10): RecentBook[] {
  return db.getAllSync<RecentBook>(
    `SELECT book_id AS id, title, author_name, cover_image, price, original_price, viewed_at
     FROM recently_viewed
     ORDER BY viewed_at DESC
     LIMIT ?`,
    [limit]
  );
}

// ─── Xóa toàn bộ lịch sử ─────────────────────────────────────────────────────
export function clearRecentlyViewed() {
  db.runSync(`DELETE FROM recently_viewed`);
}

// ─── Type ─────────────────────────────────────────────────────────────────────
export interface RecentBook {
  id: number;
  title: string;
  author_name: string;
  cover_image: string;
  price: number;
  original_price: number;
  viewed_at: number;
}