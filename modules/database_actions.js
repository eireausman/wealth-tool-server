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

CashAccount.belongsTo(User);
User.hasMany(CashAccount);

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
