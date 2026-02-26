"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TrainingCertificate extends Model {
    static associate(models) {
      TrainingCertificate.belongsTo(models.TrainingClass, {
        as: "trainingClass",
        foreignKey: "trainingClassId",
      })

      TrainingCertificate.belongsTo(models.Training, {
        as: "training",
        foreignKey: "trainingId",
      })
    }
  }
  TrainingCertificate.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      trainingId: DataTypes.UUID,
      certificateId: DataTypes.UUID,
      trainingClassId: DataTypes.INTEGER,
      createdById: DataTypes.INTEGER,
      runningNumber: DataTypes.INTEGER,
      code: DataTypes.STRING,
      fullname: DataTypes.STRING,
      email: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
      hashCode: {
        type: DataTypes.VIRTUAL,
        get() {
          const { encryptTrainingCode } = require("../helpers/func");

          const certificateId = this.getDataValue("certificateId");
          if (certificateId) return certificateId;
          
          const code = this.getDataValue("code");
          return encryptTrainingCode(code);
        },
      },
    },
    {
      sequelize,
      modelName: "TrainingCertificate",
    }
  );
  return TrainingCertificate;
};
