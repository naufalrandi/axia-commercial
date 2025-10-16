'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contract extends Model {
    static associate(models) {
      Contract.belongsToMany(models.Role, {
        through: models.ContractRole,
        foreignKey: "contractId",
        otherKey: "roleId",
        as: "secondaryRoles",
        onDelete: "CASCADE"
      })
    }
  }
  Contract.init({
    userId: DataTypes.INTEGER,
    contractCategoryId: DataTypes.INTEGER,
    placementId: DataTypes.INTEGER,
    employmentLevelId: DataTypes.INTEGER,
    structureId: DataTypes.INTEGER,
    primaryRoleId: DataTypes.INTEGER,
    designation: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Contract',
  });
  return Contract;
};