"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ContractCategory extends Model {
    static associate(models) {
      ContractCategory.hasMany(models.ContractSubcategory, {
        foreignKey: "contractCategoryId",
        as: "contractSubcategories",
      });
    }
  }
  ContractCategory.init(
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
    },
    {
      sequelize,
      modelName: "ContractCategory",
    }
  );
  return ContractCategory;
};