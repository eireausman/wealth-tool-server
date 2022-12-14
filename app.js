require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
cors = require("cors");

const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// establish db connection:
require("./modules/database_connect");
connectoDB();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var apiRouter = require("./routes/api");
var fxRateUpdater = require("./modules/getFXRates");

var cron = require("node-cron");

var app = express();

cron.schedule("59 * * * * *", () => {
  // run the update FX Rates job every minute.
  // It checks if the API should be called to protect overuse / charging of API.  Cost is a DB call each minute.
  // follow the function to see the limiting condition.
  fxRateUpdater();
});

const SequelizeStore = require("connect-session-sequelize")(session.Store);
var sqlSessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(
  session({
    secret: process.env.SQL_SESSION_SECRET,
    store: sqlSessionStore,
    resave: false,
    saveUninitialized: true,
  })
);
sqlSessionStore.sync();

passport.use(
  new LocalStrategy((username, password, done) => {
    findOneUser("users_username", username).then((userData) => {
      console.log("LOGIN: user query completed");
      if (userData === false) {
        console.log("LOGIN: usename rejected");
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, userData.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          console.log("LOGIN: passwords matched");
          const user = {
            id: userData.id,
          };
          return done(null, user);
        } else {
          // passwords do not match!
          console.log("LOGIN: password DO NOT match");
          return done(null, false, { message: "Incorrect password" });
        }
      });
    });
    console.log("LOGIN: passport check complete - LOCAL STRATEGY");
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  findOneUser("users_id", id).then((userData) => {
    const user = {
      id: userData.id,
      username: userData.username,
    };
    const err = false;
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

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
