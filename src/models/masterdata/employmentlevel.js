'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmploymentLevel extends Model {
    static associate(models) {
      // define association here
    }
  }
  EmploymentLevel.init({
    hierarchy: DataTypes.STRING,
    level: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EmploymentLevel',
  });
  return EmploymentLevel;
};