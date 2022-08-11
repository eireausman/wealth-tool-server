const { Sequelize } = require("sequelize");

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

User.hasMany(CashAccount, { foreignKey: "userUsersId" });
CashAccount.belongsTo(User, { foreignKey: "userUsersId" });
User.hasMany(Properties, { foreignKey: "userUsersId" });
CashAccount.hasMany(CashAccountBalances, { foreignKey: "account_id" });

CashAccountBalances.belongsTo(CashAccount, { foreignKey: "account_id" });
Properties.belongsTo(User, { foreignKey: "userUsersId" });

User.sync();
CashAccount.sync();
CashAccountBalances.sync();
Properties.sync();
Currencies.sync();
CurrencyCodes.sync();

const connectoDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
connectoDB();

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

module.exports = updateAccountBalanceToDB = async (accountID, balance) => {
  const today = new Date();
  try {
    const newCashAccountBalances = await CashAccountBalances.create({
      account_id: accountID,
      account_balance: balance,
      account_balance_asatdate: today,
    });

    await newCashAccountBalances.save();
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
