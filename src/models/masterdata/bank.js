"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Bank extends Model {
    static associate(models) {
      // define association here
    }
  }
  Bank.init(
    {
      code: DataTypes.STRING,
      name: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Bank",
    }
  );
  return Bank;
};
