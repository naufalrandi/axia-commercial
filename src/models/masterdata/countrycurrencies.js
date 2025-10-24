'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CountryCurrencies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CountryCurrencies.init({
    countryId: DataTypes.INTEGER,
    currencyId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CountryCurrencies',
  });
  return CountryCurrencies;
};