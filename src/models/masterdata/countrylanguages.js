'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CountryLanguages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CountryLanguages.init({
    countryId: DataTypes.INTEGER,
    languageId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CountryLanguages',
  });
  return CountryLanguages;
};