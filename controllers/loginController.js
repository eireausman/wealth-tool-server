// const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");

// check if credentials are valid
exports.logUserIn = function (req, res, next) {
  console.log(req.headers);
  console.log(req.body);
  passport.authenticate("local", {
    failureRedirect: "/api/login/userauthenticationfailed",
    failureMessage: true,
    successRedirect: "/api/login/success",
  })(req, res, next);
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
