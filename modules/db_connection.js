// const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize(
//   process.env.DATABASE_NAME,
//   process.env.RDS_USERNAME,
//   process.env.RDS_PASSWORD,
//   {
//     host: `${process.env.RDS_HOSTNAME}`,
//     dialect: "mysql",
//     storage: "./session.mysql",
//   }
// );

// const connectoDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("Connection has been established successfully.");
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// };

// connectoDB();

// // initalize sequelize with session store
// var SequelizeStore = require("connect-session-sequelize")(session.Store);

// var myStore = new SequelizeStore({
//   db: sequelize,
// });
// app.use(
//   session({
//     secret: "keyboard cat",
//     store: myStore,
//     resave: false,
//     proxy: true,
//   })
// );

// console.log(myStore);
