const { Sequelize, Op, Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Currency = sequelize.define(
    "currencies_fx",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
      },
      currency_code_from: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3],
            msg: "Code must be 3 characters in length.",
          },
        },
      },

      currency_code_to: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3],
            msg: "Code must be 3 characters in length.",
          },
        },
      },

      currency_fxrate: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          isFloat: {
            args: true,
            msg: "FX Rate must be a date",
          },
        },
      },
      currency_fxrate_dateupdated: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
          isDate: {
            args: true,
            msg: "Updated date must be a date",
          },
        },
      },
    },
    {
      timestamps: false,
    }
  );

  return Currency;
};
