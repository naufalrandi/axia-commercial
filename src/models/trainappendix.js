"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TrainAppendix extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TrainAppendix.init(
    {
      inquiryTrainingId: DataTypes.UUID,
      paymentTerms: DataTypes.JSONB,
      innerCityTransportation: DataTypes.STRING,
      interCityTransportation: DataTypes.STRING,
      accomodation: DataTypes.STRING,
      onsiteMeals: DataTypes.STRING,
      offsiteMeals: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "TrainAppendix",
    }
  );
  return TrainAppendix;
};
