"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      Supplier.belongsTo(models.Address, {
        foreignKey: "addressId",
        as: "address",
        onDelete: "CASCADE",
      });
    }
  }
  Supplier.init(
    {
      addressId: DataTypes.INTEGER,
      legalEntity: DataTypes.STRING,
      brand: DataTypes.STRING,
      type: DataTypes.STRING,
      serviceCategory: DataTypes.STRING,
      website: DataTypes.STRING,
      taxNumber: DataTypes.STRING,
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      remarks: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Supplier",
    }
  );
  return Supplier;
};
