'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoleAction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RoleAction.init({
    roleId: DataTypes.INTEGER,
    actionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'RoleAction',
  });
  return RoleAction;
};