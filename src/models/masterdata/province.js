"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Province extends Model {
    static associate(models) {
      Province.belongsTo(models.Country, {
        foreignKey: "countryId",
        as: "country",
      });

      Province.hasMany(models.City, {
        foreignKey: "provinceId",
        as: "cities",
      });
    }
  }
  Province.init(
    {
      countryId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      latlng: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "Province",
    }
  );
  return Province;
};
