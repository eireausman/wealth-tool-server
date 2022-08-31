// const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");

exports.createUserAccount = function (req, res, next) {
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) {
      return next(err);
    }
    createUser(req.body.username, hashedPassword).then((data) => {
      res.send(data);
    });
  });
};

// check if credentials are valid
exports.logUserIn = function (req, res, next) {
  passport.authenticate("local", {
    failureRedirect: "/api/login/userauthenticationfailed",
    failureMessage: true,
    successRedirect: "/api/login/success",
  })(req, res, next);
};

exports.logUserOut = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
      return next(err);
    }
    res.send("you are now logged out");
  });
};

exports.loginSuccess = function (req, res, next) {
  res.send({
    requestOutcome: true,
    message: "You have been logged in",
  });
};

exports.loginFailure = function (req, res, next) {
  res.send({
    requestOutcome: false,
    message: "Error logging in",
  });
};
