"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TrainingClass extends Model {
    static associate(models) {
      TrainingClass.belongsTo(models.Training, {
        as: "training",
        foreignKey: "trainingId",
      });

      TrainingClass.hasMany(models.TrainingCertificate, {
        as: "trainingCertificates",
        foreignKey: "trainingClassId",
      });
    }
  }
  TrainingClass.init(
    {
      trainingId: DataTypes.UUID,
      class: DataTypes.INTEGER,
      deliveryMethod: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "TrainingClass",
    }
  );
  return TrainingClass;
};
