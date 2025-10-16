require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_MASTERDATA_USER,
    password: process.env.DB_MASTERDATA_PASS,
    database: process.env.DB_MASTERDATA_NAME,
    host: process.env.DB_MASTERDATA_HOST,
    port: process.env.DB_MASTERDATA_PORT,
    dialect: process.env.DB_MASTERDATA_DIALECT,
  },
  test: {
    username: process.env.DB_MASTERDATA_USER,
    password: process.env.DB_MASTERDATA_PASS,
    database: process.env.DB_MASTERDATA_NAME,
    host: process.env.DB_MASTERDATA_HOST,
    port: process.env.DB_MASTERDATA_PORT,
    dialect: process.env.DB_MASTERDATA_DIALECT,
  },
  production: {
    username: process.env.DB_MASTERDATA_USER,
    password: process.env.DB_MASTERDATA_PASS,
    database: process.env.DB_MASTERDATA_NAME,
    host: process.env.DB_MASTERDATA_HOST,
    port: process.env.DB_MASTERDATA_PORT,
    dialect: process.env.DB_MASTERDATA_DIALECT,
  },
};
