require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
cors = require("cors");
require("./modules/database_actions");

const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var apiRouter = require("./routes/api");

var app = express();
// const port = process.env.PORT || 5001;

passport.use(
  new LocalStrategy((username, password, done) => {
    findOneUser("users_username", username).then((userData) => {
      console.log("1111111");
      if (userData === false) {
        console.log("2222222");
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, userData.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          console.log("33333333");
          const user = {
            id: userData.id,
          };
          return done(null, user);
        } else {
          // passwords do not match!
          console.log("444444444");
          return done(null, false, { message: "Incorrect password" });
        }
      });
    });
    console.log("5555555555");
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  findOneUser("users_id", id).then((userData) => {
    const user = {
      id: userData.id,
    };
    const err = false;
    done(err, user);
  });
});

app.use(
  session({
    secret: process.env.SESSION_SECRET_STRING,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

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

app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
