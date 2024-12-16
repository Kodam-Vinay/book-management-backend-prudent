const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "./booksCollection.db");

const initializeDatabase = async () => {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    return db;
  } catch (error) {
    throw new Error(`Database initialization failed: ${error.message}`);
  }
};

module.exports = { initializeDatabase };
