"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class District extends Model {
    static associate(models) {
      District.belongsTo(models.City, {
        foreignKey: "cityId",
        as: "city",
      });

      District.hasMany(models.Village, {
        foreignKey: "districtId",
        as: "villages",
      });
    }
  }
  District.init(
    {
      cityId: DataTypes.BIGINT,
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      latlng: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "District",
    }
  );
  return District;
};
