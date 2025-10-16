require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_ADMINISTRATIVE_USER,
    password: process.env.DB_ADMINISTRATIVE_PASS,
    database: process.env.DB_ADMINISTRATIVE_NAME,
    host: process.env.DB_ADMINISTRATIVE_HOST,
    port: process.env.DB_ADMINISTRATIVE_PORT,
    dialect: process.env.DB_ADMINISTRATIVE_DIALECT,
  },
  test: {
    username: process.env.DB_ADMINISTRATIVE_USER,
    password: process.env.DB_ADMINISTRATIVE_PASS,
    database: process.env.DB_ADMINISTRATIVE_NAME,
    host: process.env.DB_ADMINISTRATIVE_HOST,
    port: process.env.DB_ADMINISTRATIVE_PORT,
    dialect: process.env.DB_ADMINISTRATIVE_DIALECT,
  },
  production: {
    username: process.env.DB_ADMINISTRATIVE_USER,
    password: process.env.DB_ADMINISTRATIVE_PASS,
    database: process.env.DB_ADMINISTRATIVE_NAME,
    host: process.env.DB_ADMINISTRATIVE_HOST,
    port: process.env.DB_ADMINISTRATIVE_PORT,
    dialect: process.env.DB_ADMINISTRATIVE_DIALECT,
  },
};
