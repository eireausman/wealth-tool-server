const express = require("express");
const getCashAccountDataFromDB = require("../modules/database_actions");

// check if credentials are valid
exports.getCashAccountData = function (req, res, next) {
  const cashAccountData = getCashAccountDataFromDB(
    res.locals.currentUser.id
  ).then((data) => {
    res.send(data);
  });
};

exports.loginSuccess = function (req, res, next) {
  res.send({
    requestOutcome: true,
    message: "You have been logged in",
  });
};
