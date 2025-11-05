'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ConsultancyBusinessProcess extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ConsultancyBusinessProcess.init({
    consultancyId: DataTypes.UUID,
    businessProcessId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ConsultancyBusinessProcess',
  });
  return ConsultancyBusinessProcess;
};