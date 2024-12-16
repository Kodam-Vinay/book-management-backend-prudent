const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { initializeDatabase } = require("./db/connection");
const bookRouter = require("./Routes/bookRouter");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors({ origin: "*" }));

(async () => {
  try {
    const db = await initializeDatabase();
    db.run(
      `CREATE TABLE IF NOT EXISTS Books (
        BookID INTEGER PRIMARY KEY AUTOINCREMENT,
        Title TEXT NOT NULL,
        AuthorID INTEGER,
        GenreID INTEGER,
        Pages INTEGER,
        PublishedDate DATETIME,
        FOREIGN KEY (AuthorID) REFERENCES Authors (AuthorID),
        FOREIGN KEY (GenreID) REFERENCES Genres (GenreID)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Authors (AuthorID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS Genres (GenreID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL, Description TEXT)`
    );

    console.log("Database connected successfully.");

    app.use(
      "/api/books",
      (req, res, next) => {
        req.db = db;
        next();
      },
      bookRouter
    );

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error.message);
    process.exit(1);
  }
})();
