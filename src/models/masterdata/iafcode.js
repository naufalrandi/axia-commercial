"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class IafCode extends Model {
    static associate(models) {
      // define association here
    }
  }
  IafCode.init(
    {
      code: DataTypes.INTEGER,
      industryClassification: DataTypes.STRING,
      codeWithPrefix: {
        type: DataTypes.VIRTUAL,
        get() {
          return `IAF-${this.code}`;
        },
      },
    },
    {
      sequelize,
      modelName: "IafCode",
    }
  );
  return IafCode;
};
