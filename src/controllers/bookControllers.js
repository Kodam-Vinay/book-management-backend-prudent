const getAllBooks = async (req, res) => {
  try {
    const db = req.db;
    const { search_q = "", author = "", genre = "" } = req.query;

    // Define the base query with joins
    let query = `
      SELECT 
        Books.*,
        Authors.Name AS AuthorName,
        Genres.Name AS GenreName,
        Genres.Description AS GenreDescription
      FROM Books
      INNER JOIN Authors ON Books.AuthorID = Authors.AuthorID
      INNER JOIN Genres ON Books.GenreID = Genres.GenreID
      WHERE 1=1
    `;

    // Define query parameters
    const params = [];

    // Add conditions based on query parameters
    if (search_q) {
      query += ` AND Books.Title LIKE ?`;
      params.push(`%${search_q}%`);
    }

    if (author) {
      query += ` AND Authors.Name = ?`;
      params.push(author);
    }

    if (genre) {
      query += ` AND Genres.Name = ?`;
      params.push(genre);
    }

    // Execute the query with parameters
    const data = await db.all(query, params);

    return res.status(200).send({
      status: true,
      message: "Books Data Retrieved",
      data: {
        books: data,
      },
    });
  } catch (error) {
    res.status(400).send({
      status: false,
      message: error.message,
    });
  }
};

const storeNewBook = async (req, res) => {
  try {
    const db = req.db;
    const {
      Title,
      Pages,
      PublishedDate,
      AuthorName,
      GenreName,
      GenreDescription,
    } = req.body;

    const requiredFields = {
      Title,
      Pages,
      PublishedDate,
      AuthorName,
      GenreName,
      GenreDescription,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

    if (missingFields?.length > 0) {
      return res.status(400).send({
        status: false,
        message: `Please fill the main fields - ${missingFields.join(", ")}`,
      });
    }

    // checking genre is already exists
    const findGenre = await db.get(
      `SELECT GenreID FROM Genres WHERE Name = ?`,
      [GenreName]
    );

    let genreId;
    if (!findGenre) {
      const insertGenreQuery = `INSERT INTO Genres (Name, Description) VALUES (?, ?)`;
      const result = await db.run(insertGenreQuery, [
        GenreName,
        GenreDescription,
      ]);
      genreId = result.lastID; // Get the ID of the inserted genre
    } else {
      genreId = findGenre.GenreID;
    }

    // checking author is already exists
    let findAuthor = await db.get(
      `SELECT AuthorID FROM Authors WHERE Name = ?`,
      [AuthorName]
    );

    let authorId;
    if (!findAuthor) {
      const insertAuthorQuery = `INSERT INTO Authors (Name) VALUES(?)`;
      const result = await db.run(insertAuthorQuery, [AuthorName]);
      authorId = result.lastID;
    } else {
      authorId = findAuthor.AuthorID;
    }

    const insertBookQuery = `INSERT INTO Books (Title, Pages, PublishedDate, AuthorID, GenreID) VALUES (?, ?, ?, ?, ?)`;
    await db.run(insertBookQuery, [
      Title,
      Pages,
      PublishedDate,
      authorId,
      genreId,
    ]);
    res.status(201).send({
      status: true,
      message: "Book Added Successfully",
    });
  } catch (error) {
    res.status(400).send({
      status: false,
      message: error.message,
    });
  }
};

const updateBook = async (req, res) => {
  try {
    const db = req.db;
    const bookId = req.params.id;
    const { Title, Pages, PublishedDate, AuthorID, GenreID } = req.body;

    if (!bookId) {
      return res
        .status(400)
        .send({ status: false, message: "Book ID is required" });
    }

    const checkAuthorExist = await db.get(
      `SELECT AuthorID FROM Authors WHERE AuthorID= ?`,
      [AuthorID]
    );
    const checkGenreExist = await db.get(
      `SELECT GenreID FROM Genres WHERE GenreID= ?`,
      [GenreID]
    );
    if (!checkAuthorExist) {
      return res
        .status(400)
        .send({ status: false, message: "Author not found" });
    }
    if (!checkGenreExist) {
      return res
        .status(400)
        .send({ status: false, message: "Genre not found" });
    }

    const query = `UPDATE Books SET 
    Title = ?,
    Pages = ?,
    PublishedDate = ?,
    AuthorID = ?,
    GenreID = ?
    WHERE BookID = ?`;
    await db.run(query, [
      Title,
      Pages,
      PublishedDate,
      AuthorID,
      GenreID,
      bookId,
    ]);
    res.status(200).send({
      status: true,
      message: "Book Updated Successfully",
    });
  } catch (error) {
    res.status(400).send({
      status: false,
      message: error.message,
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const db = req.db;
    const bookId = req.params.id;
    if (!bookId) {
      return res
        .status(400)
        .send({ status: false, message: "Book ID is required" });
    }
    const query = `DELETE FROM Books WHERE BookID = ${bookId}`;
    await db.run(query);
    res.status(200).send({
      status: true,
      message: "Book Deleted Successfully",
    });
  } catch (error) {
    res.status(400).send({
      status: false,
      message: error.message,
    });
  }
};

const getAuthorAndGenresList = async (req, res) => {
  try {
    const db = req.db;
    const query = `SELECT DISTINCT Name FROM Authors`;
    const authors = await db.all(query);
    const query2 = `SELECT DISTINCT Name FROM Genres`;
    const genres = await db.all(query2);
    const availableAuthors = authors?.flatMap((each) => each?.Name);
    const availableGenres = genres?.flatMap((each) => each?.Name);
    res.status(200).send({
      status: true,
      message: "Filters Retrieved",
      data: {
        authors: availableAuthors,
        genres: availableGenres,
      },
    });
  } catch (error) {
    res.status(400).send({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllBooks,
  storeNewBook,
  updateBook,
  deleteBook,
  getAuthorAndGenresList,
};
