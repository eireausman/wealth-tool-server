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
        validate: { len: [3, 35] },
      },
      users_password: {
        type: Sequelize.STRING,

        allowNull: false,
        validate: { len: [8, 256] },
      },
    },
    {
      timestamps: false,
    }
  );
  return User;
};
