"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ConsulAppendix extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ConsulAppendix.init(
    {
      consultancyId: DataTypes.UUID,
      paymentTerms: DataTypes.JSONB,
      innerCityTransportation: DataTypes.STRING,
      interCityTransportation: DataTypes.STRING,
      accomodation: DataTypes.STRING,
      onsiteMeals: DataTypes.STRING,
      offsiteMeals: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ConsulAppendix",
    }
  );
  return ConsulAppendix;
};
