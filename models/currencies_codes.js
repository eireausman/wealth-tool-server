const { Sequelize, Op, Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CurrencyCode = sequelize.define(
    "currencies_codes",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
      },
      currency_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3 - 35],
            msg: "Code must be between 3 and 35 characters in length.",
          },
        },
      },
      currency_code: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3],
            msg: "Code must be 3 characters in length.",
          },
        },
      },
      currency_symbol: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [1],
            msg: "Symbol must be 3 characters in length.",
          },
        },
      },
    },
    {
      timestamps: false,
    }
  );

  return CurrencyCode;
};
