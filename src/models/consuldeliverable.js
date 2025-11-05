"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ConsulDeliverable extends Model {
    static associate(models) {
      // define association here
    }
  }
  ConsulDeliverable.init(
    {
      consultancyId: DataTypes.UUID,
      consultancyProgramId: DataTypes.INTEGER,
      activities: DataTypes.JSONB,
      output: DataTypes.JSONB,
      estimateDuration: DataTypes.STRING,
      position: DataTypes.INTEGER,
      month: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ConsulDeliverable",
    }
  );
  return ConsulDeliverable;
};
