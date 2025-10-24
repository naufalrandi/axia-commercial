"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    static associate(models) {
      City.belongsTo(models.Province, {
        foreignKey: "provinceId",
        as: "province",
      });

      City.hasMany(models.District, {
        foreignKey: "cityId",
        as: "districts",
      });
    }
  }
  City.init(
    {
      provinceId: DataTypes.BIGINT,
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      latlng: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "City",
    }
  );
  return City;
};
