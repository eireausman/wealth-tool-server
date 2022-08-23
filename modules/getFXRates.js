require("../modules/database_actions");
const axios = require("axios");

module.exports = updateFXRates = async () => {
  console.log("got here 3");

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
  for (i = 0; i < FXDataURLsList.length; i += 1) {
    console.log(FXDataURLsList[i]);
    const serverResponse = await axios.get(FXDataURLsList[i]);

    // for (i = 0; i < currenciesFromDB.length; i += 1) {
    //   const fromCurrencyCode = serverResponse.data.base_code;
    //   const toCurrencyCode = currenciesFromDB[i].currency_code;
    //   const fxRate =
    //     serverResponse.data.conversion_rates[toCurrencyCode];

    //   if (fromCurrencyCode !== toCurrencyCode) {
    //     console.log(
    //       "HERE I AM HERE I AM HERE I AM HERE I AM HERE I AM HERE I AM HERE I AM HERE I AM HERE I AM HERE I AM HERE I AM HERE I AM ",
    //       serverResponse.data.base_code,
    //       serverResponse.data.conversion_rates,
    //       serverResponse.data.conversion_rates[
    //         currenciesFromDB[i].currency_code
    //       ]
    //     );

    //     insertFXRateIntoDB(fromCurrencyCode, toCurrencyCode, fxRate);
    //   }
    // }
  }
};
