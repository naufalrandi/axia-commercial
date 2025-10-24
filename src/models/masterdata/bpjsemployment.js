'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BPJSemployment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BPJSemployment.init({
    shortName: DataTypes.STRING,
    name: DataTypes.STRING,
    percentageOfCompany: DataTypes.FLOAT,
    percentageOfEmployee: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'BPJSemployment',
  });
  return BPJSemployment;
};