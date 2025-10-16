'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ContractRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ContractRole.init({
    roleId: DataTypes.INTEGER,
    contractId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ContractRole',
  });
  return ContractRole;
};