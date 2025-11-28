"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ConsultancyProgramDeliverable extends Model {
    static associate(models) {
      // define association here
    }
  }
  ConsultancyProgramDeliverable.init(
    {
      consultancyProgramId: DataTypes.INTEGER,
      title: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ConsultancyProgramDeliverable",
    }
  );
  return ConsultancyProgramDeliverable;
};
