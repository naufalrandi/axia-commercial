"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ConsulDeliveryMethod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ConsulDeliveryMethod.init(
    {
      consultancyId: DataTypes.UUID,
      osCondition: DataTypes.STRING,
      osSessionAmount: DataTypes.INTEGER,
      osSessionUnit: DataTypes.STRING,
      vcCondition: DataTypes.STRING,
      vcSessionAmount: DataTypes.INTEGER,
      vcSessionUnit: DataTypes.STRING,
      textCommunication: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "ConsulDeliveryMethod",
    }
  );
  return ConsulDeliveryMethod;
};
