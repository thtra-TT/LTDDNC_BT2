import db from "./database";

export const initSearchHistoryTable = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const saveSearchHistory = async (keyword: string) => {
  if (!keyword.trim()) return;

  await db.runAsync(
    "INSERT INTO search_history (keyword) VALUES (?)",
    [keyword]
  );
};

export const getSearchHistory = async () => {
  return await db.getAllAsync(
    "SELECT * FROM search_history ORDER BY created_at DESC LIMIT 10"
  );
};