"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Standard extends Model {
    static associate(models) {
      // define association here
    }
  }
  Standard.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      schemeTagId: DataTypes.UUID,
      prefix: DataTypes.STRING,
      standardNumber: DataTypes.INTEGER,
      issueYear: DataTypes.INTEGER,
      type: DataTypes.JSONB,
      title: DataTypes.STRING,
      rate: DataTypes.BIGINT,
      document: DataTypes.STRING,
      sortName: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.getDataValue("prefix")}-${this.getDataValue(
            "standardNumber"
          )}-${this.getDataValue("issueYear")}`;
        },
      },
    },
    {
      sequelize,
      modelName: "Standard",
    }
  );
  return Standard;
};
