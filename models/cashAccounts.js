const { Sequelize, Op, Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CashAccount = sequelize.define(
    "cash_accounts",
    {
      account_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
      },
      userUsersId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      account_nickname: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 35],
            msg: "Nickname must be between 3 and 20 characters in length.",
          },
        },
      },
      account_number_last4_digits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            args: true,
            msg: "Last 4 account digits must be a number (integer).",
          },
          len: {
            args: [4, 4],
            msg: "Last 4 account digits must be 4 characters long",
          },
        },
      },
      account_owner_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 20],
            msg: "Owner name must be between 3 and 20 characters in length.",
          },
        },
      },
      account_balance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            args: true,
            msg: "Balance must be a number (integer).",
          },
        },
      },
      account_currency_code: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 3],
            msg: "Currency value must be 3 characters long.",
          },
        },
      },
      account_currency_symbol: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [1, 1],
            msg: "Currency symbol value must be 1 character long.",
          },
        },
      },
    },
    {
      timestamps: false,
    }
  );

  return CashAccount;
};
