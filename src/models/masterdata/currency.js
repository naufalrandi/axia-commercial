"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Currency extends Model {
    static associate(models) {
      // define association here
    }
  }
  Currency.init(
    {
      name: DataTypes.STRING,
      code: DataTypes.STRING,
      symbol: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Currency",
    }
  );
  return Currency;
};
