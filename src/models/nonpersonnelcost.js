"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class NonpersonnelCost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NonpersonnelCost.init(
    {
      financialPlanId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      description: DataTypes.STRING,
      rate: DataTypes.BIGINT,
      quantity: DataTypes.INTEGER,
      unit: DataTypes.STRING,
      amount: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "NonpersonnelCost",
    }
  );
  return NonpersonnelCost;
};
