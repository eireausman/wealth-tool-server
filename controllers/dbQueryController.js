const getCashAccountDataFromDB = require("../modules/database_actions");

exports.getCashAccountData = function (req, res, next) {
  const cashAccountData = getCashAccountDataFromDB(
    res.locals.currentUser.id
  ).then((data) => {
    res.send(data);
  });
};

exports.updateAccountBalance = function (req, res, next) {
  const updateBalanceRequest = updateAccountBalanceToDB(
    req.body.account_id,
    req.body.balance
  ).then((data) => {
    res.send(data);
  });
};

exports.getPropertiesData = function (req, res, next) {
  const propertyData = getPropertyDataFromDB(res.locals.currentUser.id).then(
    (data) => {
      res.send(data);
    }
  );
};

exports.getFXRate = function (req, res, next) {
  const currencyFXData = getFXRateFromDB(
    req.body.currencyFrom,
    req.body.currencyTo
  ).then((data) => {
    console.log(data);
    res.send(data);
  });
};
