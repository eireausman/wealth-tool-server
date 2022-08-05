const { Sequelize, Op, Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "users",
    {
      users_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      users_username: {
        type: Sequelize.STRING,
        unique: true,

        allowNull: false,
        validate: {
          len: {
            args: [3, 35],
            msg: "Username must be between 3 and 35 characters.",
          },
        },
      },
      users_password: {
        type: Sequelize.STRING,
        allowNull: false,
        len: {
          args: [8, 256],
          msg: "Password must be at least 8 charcters long.",
        },
      },
    },
    {
      timestamps: false,
    }
  );

  return User;
};
