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
  if (!res.locals.currentUser) {
    res.sendStatus(403);
    return;
  }
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

  // if no entries exist, exit
  if (!CashAccSummary && !propSummary) {
    res.sendStatus(204);
    return;
  }
  let CashAccSummaryArray = [];
  if (CashAccSummary) {
    JSON.parse(JSON.stringify(CashAccSummary.cash_accounts));
  }
  let propSummaryArray = [];
  if (propSummary) {
    propSummaryArray = JSON.parse(JSON.stringify(propSummary.properties));
  }

  // combine the above and get a summary by currency rather than by asset type by currency
  const totalsByCurr = totalsCalc.calculateTotalsByCurr(
    investSummary,
    CashAccSummaryArray,
    propSummaryArray
  );

  // convert to the currently selected currency in front end and return the sum of converted values
  let convertedTotal = 0;
  const selectedCurrency = req.query.selectedcurrency;
  for (item in totalsByCurr) {
    const itemValue = totalsByCurr[item];
    const rateQuery = await getFXRateFromDB(item, selectedCurrency);
    const rate = rateQuery.currency_fxrate;
    convertedTotal += itemValue * rate;
  }
  res.send({ convertedTotal });
};

exports.getTotalPosAssetValue = async function (req, res, next) {
  if (!res.locals.currentUser) {
    res.sendStatus(403);
    return;
  }

  const investSummary = await getPosInvestmentTotalsByCurrency(
    res.locals.currentUser.id
  );
  const CashAccSummary = await getPosCashAccountTotalsByCurrency(
    res.locals.currentUser.id
  );
  const propSummary = await getPosPropertyTotalsByCurrency(
    res.locals.currentUser.id
  );

  // if no entries exist, exit
  if (!investSummary && !CashAccSummary && !propSummary) {
    res.sendStatus(204);
    return;
  }

  let investSummaryArray = [];
  if (investSummary) {
    JSON.parse(JSON.stringify(investSummary.investments));
  }
  let CashAccSummaryArray = [];
  if (CashAccSummary) {
    CashAccSummaryArray = JSON.parse(
      JSON.stringify(CashAccSummary.cash_accounts)
    );
  }
  let propSummaryArray = [];
  if (propSummary) {
    const propSummaryArray = JSON.parse(JSON.stringify(propSummary.properties));
  }

  // combine the above and get a summary by currency rather than by asset type by currency
  const totalsByCurr = totalsCalc.calculateTotalsByCurr(
    investSummaryArray,
    CashAccSummaryArray,
    propSummaryArray
  );

  let convertedTotal = 0;
  const selectedCurrency = req.query.selectedcurrency;
  for (item in totalsByCurr) {
    const itemValue = totalsByCurr[item];
    const rateQuery = await getFXRateFromDB(item, selectedCurrency);
    const rate = rateQuery.currency_fxrate;
    convertedTotal += itemValue * rate;
  }

  res.send({ convertedTotal });
};

exports.getCashAccountNetTotal = async function (req, res, next) {
  if (!res.locals.currentUser) {
    res.sendStatus(403);
    return;
  }
  const CashAccSummary = await getNetCashAccountTotalsByCurrency(
    res.locals.currentUser.id
  );

  if (!CashAccSummary) {
    res.sendStatus(204);
    return;
  }

  CashAccSummaryArray = JSON.parse(
    JSON.stringify(CashAccSummary.cash_accounts)
  );

  const selectedCurrency = req.query.selectedcurrency;
  let CashAccSummaryConvertedTotal = 0;

  for (item in CashAccSummaryArray) {
    const fromCurrency = CashAccSummaryArray[item].account_currency_code;
    const totalVal = parseInt(CashAccSummaryArray[item].total);
    const rateQuery = await getFXRateFromDB(fromCurrency, selectedCurrency);
    const rate = rateQuery.currency_fxrate;

    CashAccSummaryConvertedTotal += totalVal * rate;
  }
  const returnNumber = parseInt(CashAccSummaryConvertedTotal);

  res.json(returnNumber);
};

exports.getPropertyNetTotal = async function (req, res, next) {
  if (!res.locals.currentUser) {
    res.sendStatus(403);
    return;
  }
  const propSummary = await getNetPropertyTotalsByCurrency(
    res.locals.currentUser.id
  );

  if (!propSummary) {
    res.sendStatus(204);
    return;
  }
  propSummaryArray = JSON.parse(JSON.stringify(propSummary.properties));
  console.log(propSummaryArray);

  const selectedCurrency = req.query.selectedcurrency;
  let propSummaryConvertedTotal = 0;
  for (item in propSummaryArray) {
    const fromCurrency = propSummaryArray[item].property_valuation_currency;
    const totalVal = parseInt(propSummaryArray[item].total);

    const rateQuery = await getFXRateFromDB(fromCurrency, selectedCurrency);
    const rate = rateQuery.currency_fxrate;
    propSummaryConvertedTotal += totalVal * rate;
  }
  const returnNumber = parseInt(propSummaryConvertedTotal);

  res.json(returnNumber);
};

exports.getInvestmentsTotal = async function (req, res, next) {
  if (!res.locals.currentUser) {
    res.sendStatus(403);
    return;
  }
  // investments will be + or 0, and so only need to request Pos db query:
  const investSummary = await getPosInvestmentTotalsByCurrency(
    res.locals.currentUser.id
  );

  if (!investSummary) {
    res.sendStatus(204);
    return;
  }

  investSummaryArray = JSON.parse(JSON.stringify(investSummary.investments));

  const selectedCurrency = req.query.selectedcurrency;
  let investSummaryConvertedTotal = 0;
  for (item in investSummaryArray) {
    const fromCurrency = investSummaryArray[item].holding_currency_code;
    const totalVal = parseInt(investSummaryArray[item].total);
    const rateQuery = await getFXRateFromDB(fromCurrency, selectedCurrency);
    const rate = rateQuery.currency_fxrate;
    investSummaryConvertedTotal += totalVal * rate;
  }

  const returnNumber = parseInt(investSummaryConvertedTotal);

  res.json(returnNumber);
};

exports.addNewProperty = function (req, res, next) {
  const newPropertyData = addNewPropertyToDB(
    res.locals.currentUser.id,
    req.body
  ).then((data) => {
    res.send(data);
  });
};

exports.getCashAccountData = async function (req, res, next) {
  if (!res.locals.currentUser) {
    res.sendStatus(403);
    return;
  }

  const cashAccountData = await getCashAccountDataFromDB(
    res.locals.currentUser.id
  );
  if (!cashAccountData) {
    res.sendStatus(204);
    return;
  }

  const cashAccountArrray = JSON.parse(
    JSON.stringify(cashAccountData.cash_accounts)
  );
  // convert to the currency selected in front end
  const selectedCurrency = req.query.selectedcurrency;

  for (let i = 0; i < cashAccountArrray.length; i += 1) {
    const baseCurr = cashAccountArrray[i].account_currency_code;
    const rate = await getFXRateFromDB(baseCurr, selectedCurrency);
    const accountBalConvertedValue =
      parseInt(cashAccountArrray[i].account_balance) * rate.currency_fxrate;
    cashAccountArrray[i].accountBalConvertedValue = parseInt(
      accountBalConvertedValue
    );
  }
  res.send(cashAccountArrray);
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
  /// REQUIRES USER CHECK?
  const updateBalanceRequest = updatePropValueToDB(
    req.body.property_id,
    req.body.property_valuation,
    req.body.property_loan_value
  ).then((data) => {
    res.send(data);
  });
};

exports.getPropertiesData = async function (req, res, next) {
  if (!res.locals.currentUser) {
    res.sendStatus(403);
    return;
  }
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
  if (!res.locals.currentUser) {
    res.sendStatus(403);
    return;
  }
  const selectedCurrency = req.query.selectedcurrency;

  const investmentData = await getInvestmentDataFromDB(
    res.locals.currentUser.id
  );

  if (!investmentData) {
    res.sendStatus(204);
    return;
  }

  const investmentsArray = JSON.parse(
    JSON.stringify(investmentData.investments)
  );

  // convert to the currency selected in front end
  for (let i = 0; i < investmentsArray.length; i += 1) {
    const invest_baseCurr = investmentsArray[i].holding_currency_code;
    const invest_rate = await getFXRateFromDB(
      invest_baseCurr,
      selectedCurrency
    );

    const investmentConvertedValue =
      parseInt(investmentsArray[i].virtual_BaseCurrencyValue) *
      invest_rate.currency_fxrate;
    investmentsArray[i].investmentConvertedValue = parseInt(
      investmentConvertedValue
    );
  }
  res.send(investmentsArray);
};

exports.getCurrencyData = function (req, res, next) {
  if (!res.locals.currentUser) {
    res.sendStatus(403);
    return;
  }
  const currencyCodeData = getCurrencyDataFromDB().then((data) => {
    res.send(data);
  });
};

exports.getFXRate = function (req, res, next) {
  if (!res.locals.currentUser) {
    res.sendStatus(403);
    return;
  }
  const currencyFXData = getFXRateFromDB(
    req.body.currencyFrom,
    req.body.currencyTo
  ).then((data) => {
    res.send(data);
  });
};

exports.getallFXRates = function (req, res, next) {
  if (!res.locals.currentUser) {
    res.sendStatus(403);
    return;
  } else {
    const currencyFXData = getAllFXRatesFromDB().then((data) => {
      res.send(data);
    });
  }
};
