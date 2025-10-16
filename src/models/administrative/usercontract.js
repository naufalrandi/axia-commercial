'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserContract extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserContract.init({
    userId: DataTypes.INTEGER,
    contractId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserContract',
  });
  return UserContract;
};