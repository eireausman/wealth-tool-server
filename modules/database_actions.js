const { DateTime } = require("luxon");
const { literal, Op, Sequelize } = require("sequelize");

// logging: console.log,
const cashAccounts = require("../models/cashAccounts");
const User = require("../models/user")(sequelize);
const CashAccount = require("../models/cashAccounts")(sequelize);
const CashAccountBalances = require("../models/cashAccountsBalances")(
  sequelize
);
const Properties = require("../models/Properties")(sequelize);
const Currencies = require("../models/currencies_fx")(sequelize);
const CurrencyCodes = require("../models/currencies_codes")(sequelize);
const PropertiesHistVals = require("../models/PropertiesHistVals")(sequelize);
const Investments = require("../models/investments")(sequelize);
const InvestmentPriceHistory = require("../models/investment_price_history")(
  sequelize
);

User.hasMany(CashAccount, { foreignKey: "userUsersId" });
User.hasMany(Investments, { foreignKey: "userUsersId" });
CashAccount.belongsTo(User, { foreignKey: "userUsersId" });
Investments.belongsTo(User, { foreignKey: "userUsersId" });
InvestmentPriceHistory.belongsTo(Investments, { foreignKey: "holding_id" });
User.hasMany(Properties, { foreignKey: "userUsersId" });

CashAccount.hasMany(CashAccountBalances, { foreignKey: "account_id" });
Properties.hasMany(PropertiesHistVals, { foreignKey: "property_id" });
Investments.hasMany(InvestmentPriceHistory, { foreignKey: "holding_id" });

CashAccountBalances.belongsTo(CashAccount, { foreignKey: "account_id" });
PropertiesHistVals.belongsTo(Properties, { foreignKey: "property_id" });
Properties.belongsTo(User, { foreignKey: "userUsersId" });

User.sync();
CashAccount.sync();
CashAccountBalances.sync();
Properties.sync();
Currencies.sync();
CurrencyCodes.sync();
PropertiesHistVals.sync();
Investments.sync();
InvestmentPriceHistory.sync();

module.exports = addNewCashAccountToDB = async (userID, requestBody) => {
  try {
    const newCashAccountEntry = await CashAccount.create({
      userUsersId: userID,
      account_nickname: requestBody.account_nickname,
      account_number_last4_digits: requestBody.account_number_last4_digits,
      account_owner_name: requestBody.account_owner_name,
      account_balance: requestBody.account_balance,
      account_currency_code: requestBody.account_currency_code,
      account_currency_symbol: requestBody.account_currency_symbol,
    });
    const saveResult = await newCashAccountEntry.save();

    const accountID = await saveResult.dataValues.account_id;
    const today = new Date();
    const newCashAccountHistoryEntry = await CashAccountBalances.create({
      account_id: accountID,
      account_balance: requestBody.account_balance,
      account_balance_asatdate: today,
    });
    await newCashAccountHistoryEntry.save();
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = addNewInvestmentToDB = async (
  userID,
  stockName,
  identifier,
  quantity,
  cost,
  currentPrice,
  ownerName,
  institution,
  currencySymbol,
  currencyCode
) => {
  try {
    const newInvestmentEntry = await Investments.create({
      userUsersId: userID,
      holding_owner_name: ownerName,
      holding_stock_name: stockName,
      holding_institution: institution,
      holding_market_identifier: identifier,
      holding_currency_code: currencyCode,
      holding_currency_symbol: currencySymbol,
      holding_quantity_held: quantity,
      holding_current_price: currentPrice,
      holding_cost_total_value: cost,
    });
    const saveResult = await newInvestmentEntry.save();

    const holdingID = saveResult.dataValues.holding_id;
    const today = new Date();
    const newInvestmentPriceHistoryEntry = await InvestmentPriceHistory.create({
      holding_id: holdingID,
      holding_current_price: currentPrice,
      price_asatdate: today,
    });
    await newInvestmentPriceHistoryEntry.save();
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = addNewPropertyToDB = async (userID, requestBody) => {
  try {
    const newPropEntry = await Properties.create({
      userUsersId: userID,
      property_nickname: requestBody.property_nickname,
      property_owner_name: requestBody.property_owner_name,
      property_valuation: requestBody.property_valuation,
      property_loan_value: requestBody.property_loan_value,
      property_valuation_currency: requestBody.currencyCode,
      property_valuation_curr_symbol: requestBody.currencySymbol,
    });
    const saveResult = await newPropEntry.save();

    const propID = await saveResult.dataValues.property_id;
    const today = new Date();
    const newPropValHistoryEntry = await PropertiesHistVals.create({
      property_id: propID,
      property_valuation: requestBody.property_valuation,
      property_loan_value: requestBody.property_loan_value,
      property_value_asatdate: today,
    });
    await newPropValHistoryEntry.save();
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = findAllUsers = async () => {
  const users = await User.findAll();
};

module.exports = findOneUser = async (
  search_fieldname,
  received_search_term
) => {
  try {
    const users = await User.findAll({
      attributes: ["users_id", "users_username", "users_password"],
      where: {
        [search_fieldname]: received_search_term,
      },
    });
    if (users.length === 0) {
      return false;
    }
    return {
      id: users[0].dataValues.users_id,
      username: users[0].dataValues.users_username,
      password: users[0].dataValues.users_password,
    };
  } catch (error) {
    return error;
  }
};

module.exports = createUser = async (sent_username, sent_password) => {
  const userExists = await findOneUser("users_username", sent_username);
  if (userExists === false) {
    try {
      const userAccount = await User.create({
        users_username: sent_username,
        users_password: sent_password,
      });

      await userAccount.save();

      const message = {
        requestOutcome: true,
        message: "Account created.",
      };
      return message;
    } catch (err) {
      return err;
    }
  }
  const message = {
    requestOutcome: false,
    message: `Error: Account ${sent_username} already exists.`,
  };
  return message;

  // 'catch' appears to be resolved by sequelize
};

module.exports = getCurrencyDataFromDB = async () => {
  try {
    const currenciesCodesQuery = await CurrencyCodes.findAll({
      order: [["currency_name", "ASC"]],
    });
    return currenciesCodesQuery;
  } catch (error) {
    return error;
  }
};

module.exports = getAllFXRatesFromDB = async () => {
  try {
    const currenciesQuery = await Currencies.findAll({
      order: [["currency_code_from", "ASC"]],
    });

    // have to stringify query to retrieve virtuals and then convert back to JS to convey to Front End
    const JSONoutput = JSON.stringify(currenciesQuery, null, 2);
    const queryOutputArray = JSON.parse(JSONoutput);

    return queryOutputArray;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = getFXRateFromDB = async (from, to) => {
  try {
    const currenciesQuery = await Currencies.findOne({
      where: {
        currency_code_from: from,
        currency_code_to: to,
      },
      order: [["currency_fxrate_dateupdated", "DESC"]],
    });

    return await currenciesQuery.dataValues;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = insertFXRateIntoDB = async (
  fromCurrency,
  toCurrency,
  fxRate
) => {
  const today = new Date();
  try {
    const checkifExists = await Currencies.count({
      where: { currency_code_from: fromCurrency, currency_code_to: toCurrency },
    });

    if ((await checkifExists) === 0) {
      const newCurrency = await Currencies.create({
        currency_code_from: fromCurrency,
        currency_code_to: toCurrency,
        currency_fxrate: fxRate,
        currency_fxrate_dateupdated: today,
      });

      await newCurrency.save();
    } else {
      await Currencies.update(
        {
          currency_fxrate: fxRate,
          currency_fxrate_dateupdated: today,
        },
        {
          where: {
            currency_code_from: fromCurrency,
            currency_code_to: toCurrency,
          },
        }
      );
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = wereRatesUpdatedRecently = async () => {
  const nDaysAgoDate = DateTime.now()
    .minus({ days: 1 })
    .toISODate(DateTime.DATE_MED);

  try {
    const RatesUpdatedRecently = await Currencies.count({
      where: {
        currency_fxrate_dateupdated: {
          [Op.gt]: nDaysAgoDate,
        },
      },
    });

    if (RatesUpdatedRecently > 0) return true;
    // 0 = rates were recently updated.
    return false;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = updateAccountBalanceToDB = async (accountID, balance) => {
  const today = new Date();
  try {
    const entryExistsCheck = await CashAccountBalances.count({
      where: { account_id: accountID, account_balance_asatdate: today },
    });

    if (entryExistsCheck === 0) {
      const newCashAccountBalances = await CashAccountBalances.create({
        account_id: accountID,
        account_balance: balance,
        account_balance_asatdate: today,
      });

      await newCashAccountBalances.save();
    } else {
      await CashAccountBalances.update(
        {
          account_id: accountID,
          account_balance: balance,
        },
        {
          where: { account_id: accountID, account_balance_asatdate: today },
        }
      );
    }
    // update the parent record to reflect the latest value (for querying ease)
    await CashAccount.update(
      {
        account_balance: balance,
      },
      {
        where: { account_id: accountID },
      }
    );
  } catch (err) {
    return err;
  }
};

module.exports = getPropertyDataFromDB = async (reslocalsuser) => {
  try {
    const usersPropertyDataQuery = await User.findOne({
      attributes: ["users_id"],
      where: {
        users_id: reslocalsuser,
      },
      include: {
        model: Properties,
        where: {
          soft_deleted: 0,
        },
      },
    });
    // returns an array of properties owned by the current user
    const usersPropertyData = usersPropertyDataQuery.properties.map(function (
      record
    ) {
      return record.dataValues;
    });
    return usersPropertyData;
  } catch (err) {
    return err;
  }
};

module.exports = getInvestmentDataFromDB = async (reslocalsuser) => {
  try {
    const usersInvestmentQuery = await User.findOne({
      attributes: ["users_id"],
      order: [
        [Investments, "holding_owner_name", "ASC"],
        [Investments, "holding_stock_name", "ASC"],
      ],
      where: {
        users_id: reslocalsuser,
      },
      include: {
        model: Investments,
        where: {
          soft_deleted: 0,
        },
      },
    });
    const JSONoutput = JSON.stringify(usersInvestmentQuery, null, 2);
    const queryOutputArray = JSON.parse(JSONoutput);

    // returns an array of investments owned by the current user
    // const usersInvestmentData = usersInvestmentQuery.investments.map(function (
    //   record
    // ) {
    //   return record.dataValues;
    // });
    return await queryOutputArray;
  } catch (err) {
    return err;
  }
};

module.exports = getPosInvestmentTotalsByCurrency = async (reslocalsuser) => {
  try {
    const usersInvestmentData = await User.findOne({
      group: ["holding_currency_code"],
      where: {
        users_id: reslocalsuser,
      },
      include: {
        model: Investments,

        where: {
          soft_deleted: 0,
          holding_current_price: {
            [Op.gt]: 0,
          },
          holding_quantity_held: {
            [Op.gt]: 0,
          },
        },

        attributes: [
          "holding_currency_code",

          [
            sequelize.literal(
              "SUM(COALESCE(holding_current_price, 0) * COALESCE(holding_quantity_held, 0))"
            ),
            "total",
          ],
        ],
      },
    });
    return await usersInvestmentData.investments;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = getDebtCashAccountTotalsByCurrency = async (reslocalsuser) => {
  try {
    const usersCashAccountData = await User.findOne({
      group: ["account_currency_code"],
      where: {
        users_id: reslocalsuser,
      },
      include: {
        model: CashAccount,
        where: {
          soft_deleted: 0,
          account_balance: {
            [Op.lt]: 0,
          },
        },
        attributes: [
          "account_currency_code",
          [sequelize.fn("sum", sequelize.col("account_balance")), "total"],
        ],
      },
    });
    return await usersCashAccountData.cash_accounts;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = getDebtPropertyTotalsByCurrency = async (reslocalsuser) => {
  try {
    const usersPropertyValueData = await User.findOne({
      group: ["property_valuation_currency"],
      where: {
        users_id: reslocalsuser,
      },
      include: {
        model: Properties,

        where: {
          soft_deleted: 0,
        },

        attributes: [
          "property_valuation_currency",
          [
            sequelize.fn("sum", sequelize.col("property_loan_value")),
            "totalPositiveNumber",
          ],
          [
            sequelize.literal("SUM(COALESCE(property_loan_value, 0) * -1)"),
            "total",
          ],
        ],
      },
    });
    return await usersPropertyValueData.properties;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = getPosCashAccountTotalsByCurrency = async (reslocalsuser) => {
  try {
    const usersCashAccountData = await User.findOne({
      group: ["account_currency_code"],
      where: {
        users_id: reslocalsuser,
      },
      include: {
        model: CashAccount,
        where: {
          soft_deleted: 0,
          account_balance: {
            [Op.gt]: 0,
          },
        },
        attributes: [
          "account_currency_code",
          [sequelize.fn("sum", sequelize.col("account_balance")), "total"],
        ],
      },
    });
    return await usersCashAccountData.cash_accounts;
  } catch (err) {
    console.log(err);
    return err;
  }
};
module.exports = getPosPropertyTotalsByCurrency = async (reslocalsuser) => {
  try {
    const usersPropertyValueData = await User.findOne({
      group: ["property_valuation_currency"],
      where: {
        users_id: reslocalsuser,
      },
      include: {
        model: Properties,

        where: {
          soft_deleted: 0,
        },

        attributes: [
          "property_valuation_currency",
          [sequelize.fn("sum", sequelize.col("property_valuation")), "total"],
        ],
      },
    });
    return await usersPropertyValueData.properties;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = getNetCashAccountTotalsByCurrency = async (reslocalsuser) => {
  try {
    const usersCashAccountData = await User.findOne({
      group: ["account_currency_code"],
      where: {
        users_id: reslocalsuser,
      },
      include: {
        model: CashAccount,
        where: {
          soft_deleted: 0,
        },
        attributes: [
          "account_currency_code",
          [sequelize.fn("sum", sequelize.col("account_balance")), "total"],
        ],
      },
    });
    return await usersCashAccountData.cash_accounts;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = getNetPropertyTotalsByCurrency = async (reslocalsuser) => {
  try {
    const usersPropertyValueData = await User.findOne({
      group: ["property_valuation_currency"],
      where: {
        users_id: reslocalsuser,
      },
      include: {
        model: Properties,

        where: {
          soft_deleted: 0,
        },

        attributes: [
          "property_valuation_currency",
          [
            sequelize.literal(
              "SUM(COALESCE(property_valuation, 0) - COALESCE(property_loan_value, 0))"
            ),
            "total",
          ],
        ],
      },
    });
    return await usersPropertyValueData.properties;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = updatePropValueToDB = async (propID, propVal, propLoanVal) => {
  const today = new Date();
  try {
    const entryExistsCheck = await PropertiesHistVals.count({
      where: {
        property_value_asatdate: today,
        property_id: propID,
      },
    });

    if (entryExistsCheck === 0) {
      const newPropValues = await PropertiesHistVals.create({
        property_id: propID,
        property_valuation: propVal,
        property_loan_value: propLoanVal,
        property_value_asatdate: today,
      });

      await newPropValues.save();
    } else {
      await PropertiesHistVals.update(
        {
          property_id: propID,
          property_valuation: propVal,
          property_loan_value: propLoanVal,
        },
        {
          where: { property_value_asatdate: today, property_id: propID },
        }
      );
    }
    // update the parent record to reflect the latest value (for querying ease)
    await Properties.update(
      {
        property_valuation: propVal,
        property_loan_value: propLoanVal,
      },
      {
        where: { property_id: propID },
      }
    );
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = getCashAccountDataFromDB = async (reslocalsuser) => {
  try {
    const usersCashAccounts = await User.findOne({
      attributes: ["users_id"],
      where: {
        users_id: reslocalsuser,
      },
      include: {
        model: CashAccount,
        where: {
          soft_deleted: 0,
        },
      },
    });
    // have to stringify query to retrieve virtuals and then convert back to JS to convey to Front End
    const JSONoutput = JSON.stringify(usersCashAccounts, null, 2);
    const queryOutputArray = JSON.parse(JSONoutput);
    // returns an array of accounts owned by the current user
    return queryOutputArray;
  } catch (err) {
    return err;
  }
};
