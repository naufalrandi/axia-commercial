"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Language extends Model {
    static associate(models) {
      // define association here
    }
  }
  Language.init(
    {
      code: DataTypes.STRING,
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Language",
    }
  );
  return Language;
};
