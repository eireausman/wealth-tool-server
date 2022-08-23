const { DateTime } = require("luxon");
const { Op, Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.RDS_USERNAME,
  process.env.RDS_PASSWORD,
  {
    host: `${process.env.RDS_HOSTNAME}`,
    dialect: "mysql",
  }
);

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

const connectoDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
connectoDB();

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
  console.log(requestBody);
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

    const propID = saveResult.dataValues.property_id;
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

module.exports = getCurrencyDataFromDB = async (receivedCurrencyCode) => {
  try {
    const currenciesCodesQuery = await CurrencyCodes.findAll({
      order: [["currency_name", "ASC"]],
    });
    return currenciesCodesQuery;
  } catch (error) {
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
    return currenciesQuery;
  } catch (error) {
    return error;
  }
};

module.exports = insertFXRateIntoDB = async (from, to, rate) => {
  console.log(from);
  console.log(to);
  console.log(rate);
  // try {
  //   const insertQuery = await Currencies.findOrCreate({
  //     where: { currency_code_from: from, currency_code_to: to },
  //   });
  //   return await insertQuery;
  // } catch (error) {
  //   console.log(error);
  //   return error;
  // }
};

module.exports = wereRatesUpdatedRecently = async () => {
  const fiveDaysAgoDate = DateTime.now()
    .minus({ days: 5 })
    .toISODate(DateTime.DATE_MED);

  try {
    const RatesUpdatedRecently = await Currencies.count({
      where: {
        currency_fxrate_dateupdated: {
          [Op.gt]: fiveDaysAgoDate,
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
    const usersPropertyData = await User.findOne({
      attributes: ["users_id"],
      include: Properties,
      where: {
        users_id: reslocalsuser,
      },
    });
    // returns an array of properties owned by the current user
    return usersPropertyData.properties;
  } catch (err) {
    return err;
  }
};

module.exports = getInvestmentDataFromDB = async (reslocalsuser) => {
  try {
    const usersInvestmentData = await User.findOne({
      attributes: ["users_id"],
      order: [
        [Investments, "holding_owner_name", "ASC"],
        [Investments, "holding_stock_name", "ASC"],
      ],
      include: {
        model: Investments,
      },
      where: {
        users_id: reslocalsuser,
      },
    });

    // returns an array of investments owned by the current user

    return await usersInvestmentData.investments;
  } catch (err) {
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
    console.log(entryExistsCheck);
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
      include: CashAccount,
      where: {
        users_id: reslocalsuser,
      },
    });

    // returns an array of accounts owned by the current user
    return usersCashAccounts.cash_accounts;
  } catch (err) {
    return err;
  }
};
