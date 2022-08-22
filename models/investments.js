const { Sequelize, Op, Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Investments = sequelize.define(
    "investments",
    {
      holding_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
      },
      userUsersId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      holding_owner_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 20],
            msg: "Owner name must be between 3 and 20 characters in length.",
          },
        },
      },
      holding_stock_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 40],
            msg: "Stock name must be between 3 and 40 characters in length.",
          },
        },
      },
      holding_institution: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 35],
            msg: "Instituation must be between 3 and 20 characters in length.",
          },
        },
      },
      holding_market_identifier: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 35],
            msg: "ID must be between 3 and 20 characters in length.",
          },
        },
      },
      holding_currency_code: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 3],
            msg: "Currency value must be 3 characters long.",
          },
        },
      },
      holding_currency_symbol: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [1, 1],
            msg: "Currency symbol value must be 1 character long.",
          },
        },
      },
      holding_quantity_held: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
      holding_cost_total_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return Investments;
};
