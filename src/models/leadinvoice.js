'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeadInvoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LeadInvoice.init({
    leadId: DataTypes.UUID,
    invoiceId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'LeadInvoice',
  });
  return LeadInvoice;
};