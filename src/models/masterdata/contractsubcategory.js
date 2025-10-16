"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContractSubcategory extends Model {
    static associate(models) {
      ContractSubcategory.belongsTo(models.ContractCategory, {
        foreignKey: "contractCategoryId",
        as: "contractCategory",
      });

      ContractSubcategory.hasMany(models.ContractVariant, {
        foreignKey: "contractSubcategoryId",
        as: "contractVariants",
      });
    }
  }
  ContractSubcategory.init(
    {
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contractCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ContractSubcategory",
    }
  );
  return ContractSubcategory;
};