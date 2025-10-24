"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Village extends Model {
    static associate(models) {
      Village.belongsTo(models.District, {
        foreignKey: "districtId",
        as: "district",
      });
    }
  }
  Village.init(
    {
      districtId: DataTypes.BIGINT,
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      latlng: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "Village",
    }
  );
  return Village;
};
