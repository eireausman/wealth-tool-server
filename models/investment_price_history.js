const { Sequelize, Op, Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InvestmentPriceHistory = sequelize.define(
    "investment_price_history",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      holding_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },

      holding_current_price: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            args: true,
            msg: "Price must be a number (integer I.e. 152p or 152c).",
          },
        },
      },
      price_asatdate: {
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

  return InvestmentPriceHistory;
};
