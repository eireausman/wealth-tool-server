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

const connectoDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

connectoDB();
