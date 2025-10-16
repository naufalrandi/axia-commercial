"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContractVariant extends Model {
    static associate(models) {
      ContractVariant.belongsTo(models.ContractSubcategory, {
        foreignKey: "contractSubcategoryId",
        as: "contractSubcategory",
      });
    }
  }
  ContractVariant.init(
    {
      contractSubcategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ContractVariant",
    }
  );
  return ContractVariant;
};
