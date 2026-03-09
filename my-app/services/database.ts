import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("app.db");

export default db;