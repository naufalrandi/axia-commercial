"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LegalEntityType extends Model {
    static associate(models) {
      // define association here
    }
  }
  LegalEntityType.init(
    {
      nameId: DataTypes.STRING,
      nameEn: DataTypes.STRING,
      prefix: DataTypes.STRING,
      suffix: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "LegalEntityType",
    }
  );
  return LegalEntityType;
};
