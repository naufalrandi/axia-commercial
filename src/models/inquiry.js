'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inquiry extends Model {
    static associate(models) {
      // define association here
      Inquiry.belongsTo(models.Lead, {
        foreignKey: 'leadId',
        as: 'lead'
      });
    }
  }
  Inquiry.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    leadId: DataTypes.UUID,
    serviceId: DataTypes.INTEGER,
    salesPersonId: DataTypes.INTEGER,
    runningNumber: DataTypes.INTEGER,
    code: DataTypes.STRING,
    proposalGeneratedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Inquiry',
  });
  return Inquiry;
};