exports.calculateTotalsByCurr = function (
  investSummary,
  CashAccSummary,
  propSummary
) {
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

  return totalsByCurr;
};
