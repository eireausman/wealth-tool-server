require("../modules/database_actions");
const axios = require("axios");

module.exports = updateFXRates = async () => {
  const areFXRatesUpToDate = await wereRatesUpdatedRecently();
  if (areFXRatesUpToDate === false) {
    const currenciesFromDB = await getCurrencyDataFromDB();
    const FXDataURLsList = [];
    currenciesFromDB.forEach((fromCurrency) => {
      const URL = `${process.env.FXRATES_API_URL}${fromCurrency.currency_code}`;
      FXDataURLsList.push(URL);
    });

    FXDataFromAPI(FXDataURLsList, currenciesFromDB);
  }
};

const FXDataFromAPI = async (FXDataURLsList, currenciesFromDB) => {
  let tempList = [];

  for (url of FXDataURLsList) {
    const serverResponse = await axios.get(url);

    for (currency of currenciesFromDB) {
      const fromCurrencyCode = serverResponse.data.base_code;
      const toCurrencyCode = currency.currency_code;
      const fxRate = serverResponse.data.conversion_rates[toCurrencyCode];

      const tempListEntry = {
        url,
        toCurrencyCode,
        toCurrencyCode,
        toCurrencyCode,
      };
      tempList.push(tempListEntry);

      await insertFXRateIntoDB(fromCurrencyCode, toCurrencyCode, fxRate);
    }
  }
};
