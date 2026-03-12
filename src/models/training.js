"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Training extends Model {
    static associate(models) {
      Training.hasMany(models.TrainingClass, {
        foreignKey: "trainingId",
        as: "trainingClasses",
      });

      Training.hasMany(models.TrainingCertificate, {
        foreignKey: "trainingId",
        as: "trainingCertificates",
      });

      Training.hasOne(models.Project, {
        foreignKey: "trainingId",
        as: "project",
      });
    }
  }
  Training.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      inquiryTrainingId: DataTypes.UUID,
      trainingCourseId: DataTypes.UUID,
      runningNumber: DataTypes.INTEGER,
      code: DataTypes.STRING,
      courseMaterialFormat: DataTypes.STRING,
      certificateFormat: DataTypes.STRING,
      courseType: DataTypes.STRING,
      issuer: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Training",
    }
  );
  return Training;
};
