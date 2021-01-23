var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Import sequelize from models/index.js
const { sequelize } = require("./models");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// Authenticate connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to the database successful!");

    // Sync all tables
    await sequelize.sync();
  } catch (err) {
    // Database connection error
    console.log("Error connecting to the database: ", err);
  }
})();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

/* Error Handlers */

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error();
  err.status = 404;
  err.message = `Looks like the page you requested doesn't exist.`;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).render("page-not-found", { err });
  } else {
    err.message =
      err.message || "Oops! It looks like something went wrong on our end.";
    res.status(err.status || 500).render("error", { err });
  }
});

module.exports = app;
