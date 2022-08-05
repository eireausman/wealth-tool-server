const { Sequelize, Op, Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CashAccount = sequelize.define(
    "cash_accounts",
    {
      account_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userUsersId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      account_nickname: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
          len: {
            args: [3, 35],
            msg: "Nickname must be between 3 and 20 characters in length.",
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
      account_currency: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 3],
            msg: "Currency value must be 3 characters long.",
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
