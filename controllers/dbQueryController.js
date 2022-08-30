const { reduce, forEach } = require("async");
const totalsCalc = require("../modules/totalsCalcs");
require("../modules/database_actions");

exports.addNewInvestment = function (req, res, next) {
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

exports.getDebtTotalValue = async function (req, res, next) {
  // investments cannot be in debt, so no query required.  Empty array provided to pass to totalsByCurr.
  // This is a bit messy. Refactoring isn't straight forward because a list of all currencies needs providing which is a combined view.
  // That happens downstream from here.
  const investSummary = [];

  const CashAccSummary = await getDebtCashAccountTotalsByCurrency(
    res.locals.currentUser.id
  );
  const propSummary = await getDebtPropertyTotalsByCurrency(
    res.locals.currentUser.id
  );

  // combine the above and get a summary by currency rather than by asset type by currency
  const totalsByCurr = totalsCalc.calculateTotalsByCurr(
    investSummary,
    CashAccSummary,
    propSummary
  );

  // convert to the currently selected currency in front end and return the sum of converted values
  let convertedTotal = 0;
  const selectedCurrency = req.query.selectedcurrency;
  for (item in totalsByCurr) {
    const rateQuery = await getFXRateFromDB(item, selectedCurrency);
    const rate = rateQuery.currency_fxrate;
    convertedTotal += totalsByCurr[item] * rate;
  }
  res.send({ convertedTotal });
};

exports.getTotalPosAssetValue = async function (req, res, next) {
  const investSummary = await getPosInvestmentTotalsByCurrency(
    res.locals.currentUser.id
  );
  const CashAccSummary = await getPosCashAccountTotalsByCurrency(
    res.locals.currentUser.id
  );
  const propSummary = await getPosPropertyTotalsByCurrency(
    res.locals.currentUser.id
  );

  const currenciesArray = [];

  investSummary.forEach((item) => {
    currenciesArray.push(item.holding_currency_code);
  });
  CashAccSummary.forEach((item) => {
    currenciesArray.push(item.account_currency_code);
  });
  propSummary.forEach((item) => {
    currenciesArray.push(item.property_valuation_currency);
  });
  //gets unique currencies list from above sets:
  const uniqueCurrenciesList = [
    ...new Set(currenciesArray.map((item) => item)),
  ];

  let totalsByCurr = {};
  uniqueCurrenciesList.forEach((currencyCode) => {
    if (!totalsByCurr.hasOwnProperty(currencyCode)) {
      totalsByCurr[currencyCode] = 0;
    }
    investSummary.forEach((item) => {
      if (item.dataValues.holding_currency_code === currencyCode) {
        totalsByCurr[currencyCode] =
          parseInt(totalsByCurr[currencyCode]) +
          parseInt(item.dataValues.total);
      }
    });
    CashAccSummary.forEach((item) => {
      if (item.dataValues.account_currency_code === currencyCode) {
        totalsByCurr[currencyCode] =
          parseInt(totalsByCurr[currencyCode]) +
          parseInt(item.dataValues.total);
      }
    });
    propSummary.forEach((item) => {
      if (item.dataValues.property_valuation_currency === currencyCode) {
        totalsByCurr[currencyCode] =
          parseInt(totalsByCurr[currencyCode]) +
          parseInt(item.dataValues.total);
      }
    });
  });

  let convertedTotal = 0;
  const selectedCurrency = req.query.selectedcurrency;
  for (item in totalsByCurr) {
    const rateQuery = await getFXRateFromDB(item, selectedCurrency);
    const rate = rateQuery.currency_fxrate;
    convertedTotal += totalsByCurr[item] * rate;
  }

  res.send({ convertedTotal });
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

exports.getPropertiesData = async function (req, res, next) {
  const selectedCurrency = req.query.selectedcurrency;

  const propertyData = await getPropertyDataFromDB(res.locals.currentUser.id);

  for (let i = 0; i < propertyData.length; i += 1) {
    const prop_baseCurr = propertyData[i].property_valuation_currency;
    const prop_rate = await getFXRateFromDB(prop_baseCurr, selectedCurrency);

    const prop_totalConvertedValue =
      (parseInt(propertyData[i].property_valuation) -
        parseInt(propertyData[i].property_loan_value)) *
      prop_rate.currency_fxrate;
    propertyData[i].propertyValuationInSelCurr = parseInt(
      prop_totalConvertedValue
    );
  }

  res.send(propertyData);
};

exports.getInvestmentsData = async function (req, res, next) {
  const selectedCurrency = req.query.selectedcurrency;

  const investmentData = await getInvestmentDataFromDB(
    res.locals.currentUser.id
  );

  for (let i = 0; i < investmentData.length; i += 1) {
    const invest_baseCurr = investmentData[i].holding_currency_code;
    const invest_rate = await getFXRateFromDB(
      invest_baseCurr,
      selectedCurrency
    );

    const invest_totalConvertedValue =
      parseInt(investmentData[i].virtual_BaseCurrencyValue) *
      invest_rate.currency_fxrate;
    investmentData[i].investmentValuationInSelCurr = parseInt(
      invest_totalConvertedValue
    );
  }
  res.send(investmentData);
};

exports.getCurrencyData = function (req, res, next) {
  const currencyCodeData = getCurrencyDataFromDB().then((data) => {
    res.send(data);
  });
};

exports.getFXRate = function (req, res, next) {
  const currencyFXData = getFXRateFromDB(
    req.body.currencyFrom,
    req.body.currencyTo
  ).then((data) => {
    res.send(data);
  });
};
