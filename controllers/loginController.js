const express = require("express");
const passport = require("passport");

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
  const message = {
    loginOutcome: true,
  };
  res.json({
    message,
  });
};

exports.loginFailure = function (req, res, next) {
  const message = {
    loginOutcome: false,
  };
  res.json({
    message,
  });
};

exports.createUserAccount = function (req, res, next) {
  console.log(req.body.username, req.body.password);
  createUser(req.body.username, req.body.password).then((data) => {
    res.send(data);
  });
};
