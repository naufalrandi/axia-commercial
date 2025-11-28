"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Invoice.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      runningNumber: DataTypes.INTEGER,
      code: DataTypes.STRING,
      proposalNumber: DataTypes.STRING,
      purchaseOrderNumber: DataTypes.STRING,
      issueDate: DataTypes.DATE,
      dueDate: DataTypes.DATE,
      paymentTerm: DataTypes.JSONB,
      client: DataTypes.JSONB,
      billTo: DataTypes.JSONB,
      investmentFees: DataTypes.JSONB,
      bankAccount: DataTypes.JSONB,
      location: DataTypes.JSONB,
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Invoice",
    }
  );
  return Invoice;
};
