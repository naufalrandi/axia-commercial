"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TrainingClass extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TrainingClass.init(
    {
      trainingId: DataTypes.UUID,
      class: DataTypes.INTEGER,
      participant: DataTypes.INTEGER,
      deliveryMethod: DataTypes.STRING,
      startDate: DataTypes.DATE,
      enddate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "TrainingClass",
    }
  );
  return TrainingClass;
};
