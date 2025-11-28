"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ConsultancyProgram extends Model {
    static associate(models) {
      ConsultancyProgram.hasMany(models.ConsultancyProgramDeliverable, {
        foreignKey: "consultancyProgramId",
        as: "deliverables",
      });
    }
  }
  ConsultancyProgram.init(
    {
      title: DataTypes.STRING,
      activityDescription: DataTypes.TEXT,
      outputDescription: DataTypes.TEXT,
      axiaResponsibilities: DataTypes.TEXT,
      clientResponsibilities: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "ConsultancyProgram",
    }
  );
  return ConsultancyProgram;
};
