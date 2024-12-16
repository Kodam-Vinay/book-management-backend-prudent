const express = require("express");
const {
  getAllBooks,
  storeNewBook,
  updateBook,
  deleteBook,
  getAuthorAndGenresList,
} = require("../controllers/bookControllers");
const router = express.Router();

router.get("/", getAllBooks);
router.post("/", storeNewBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);
router.get("/filter-list", getAuthorAndGenresList);

module.exports = router;
