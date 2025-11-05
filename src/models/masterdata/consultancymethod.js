'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ConsultancyMethod extends Model {
    static associate(models) {
      // define association here
    }
  }
  ConsultancyMethod.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    durations: {
      type: DataTypes.JSONB,
      get() {
        const rawValue = this.getDataValue('durations');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('durations', JSON.stringify(value));
      }
    }
  }, {
    sequelize,
    modelName: 'ConsultancyMethod',
  });
  return ConsultancyMethod;
};