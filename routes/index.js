var express = require("express");
var router = express.Router();

// Import 'Book' model
const { Book } = require("../models/");

// Handler function to wrap each route
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

// Book doesn't exist error handler
function errorHandler(errStatus, msg) {
  const err = new Error(msg);
  err.status = errStatus;
  throw err;
}

// Get / - redirect to /books route
router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.redirect("/books");
  })
);

// Get /books - shows full list of books
router.get(
  "/books",
  asyncHandler(async (req, res) => {
    // SELECT * FROM Book
    const books = await Book.findAll();
    res.render("index", { books, title: "Books" });
  })
);

// Get /books/new - shows create new book form
router.get("/books/new", (req, res) => {
  res.render("new-book", { book: {}, title: "New Book" });
});

// Post /books/new - posts a new book to the DB
router.post(
  "/books/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      // Create new book
      book = await Book.create(req.body);
      res.redirect("/");
    } catch (error) {
      // Empty field handler
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        res.render("new-book", {
          book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        throw error;
      }
    }
  })
);

// Get /books/:id - shows book detail form
router.get(
  "/books/:id",
  asyncHandler(async (req, res) => {
    // Get unique book
    const book = await Book.findByPk(req.params.id);
    // Unmatched book handler
    if (book) {
      res.render("update-book", { book, title: "UpdateBook" });
    } else {
      errorHandler(404, `Can't find book`);
    }
  })
);

// Post /books/:id - updates book info in DB
router.post(
  "/books/:id",
  asyncHandler(async (req, res) => {
    let book;
    try {
      // Update book contents if exists
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/books");
      } else {
        errorHandler(404, `Can't find book`);
      }
    } catch (error) {
      // Empty field handler
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render("update-book", {
          book,
          errors: error.errors,
          title: "Update Book",
        });
      } else {
        throw error;
      }
    }
  })
);

// Post /books/:id/delete - deletes a book

router.post(
  "/books/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    // Delete book if exists
    if (book) {
      await book.destroy(req.body);
      res.redirect("/books");
    } else {
      errorHandler(500, `Server error`);
    }
  })
);

module.exports = router;
