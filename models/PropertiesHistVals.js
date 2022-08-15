const { Sequelize, Op, Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Properties = sequelize.define(
    "properties_historic_values",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      property_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      property_valuation: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            args: true,
            msg: "Value must be a number (integer).",
          },
        },
      },
      property_loan_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            args: true,
            msg: "Loan amount must be a number (integer).",
          },
        },
      },
      property_value_asatdate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
          isDate: {
            args: true,
            msg: "As At Date must be a date format",
          },
        },
      },
    },
    {
      timestamps: false,
    }
  );

  return Properties;
};
