"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TrainingCertificate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
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
      trainingClassId: DataTypes.INTEGER,
      createdById: DataTypes.INTEGER,
      runningNumber: DataTypes.INTEGER,
      code: DataTypes.STRING,
      fullname: DataTypes.STRING,
      email: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "TrainingCertificate",
    }
  );
  return TrainingCertificate;
};
