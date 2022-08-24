require("../modules/database_actions");

exports.addNewInvestment = function (req, res, next) {
  console.log("request", req.body);
  const cashAccountData = addNewInvestmentToDB(
    res.locals.currentUser.id,
    req.body.stockName,
    req.body.identifier,
    req.body.quantity,
    req.body.cost,
    req.body.currentPrice,
    req.body.ownerName,
    req.body.institution,
    req.body.currencySymbol,
    req.body.currencyCode
  ).then((data) => {
    res.send(data);
  });
};

exports.addNewCashAccount = function (req, res, next) {
  const newPropertyData = addNewCashAccountToDB(
    res.locals.currentUser.id,
    req.body
  ).then((data) => {
    res.send(data);
  });
};

exports.addNewProperty = function (req, res, next) {
  const newPropertyData = addNewPropertyToDB(
    res.locals.currentUser.id,
    req.body
  ).then((data) => {
    res.send(data);
  });
};

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

exports.updatePropValue = function (req, res, next) {
  const updateBalanceRequest = updatePropValueToDB(
    req.body.property_id,
    req.body.property_valuation,
    req.body.property_loan_value
  ).then((data) => {
    res.send(data);
  });
};

exports.getInvestmentsData = function (req, res, next) {
  const investmentData = getInvestmentDataFromDB(
    res.locals.currentUser.id
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

exports.getCurrencyData = function (req, res, next) {
  const currencyCodeData = getCurrencyDataFromDB(req.body.currencyCode).then(
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
    res.send(data);
  });
};
