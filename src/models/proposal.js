"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Proposal extends Model {
    static associate(models) {
      Proposal.belongsTo(models.Lead, {
        foreignKey: "leadId",
        as: "lead",
      });

      Proposal.belongsTo(models.LeadContact, {
        foreignKey: "leadContactId",
        as: "leadContact",
      });

      Proposal.belongsTo(models.LeadBillingContact, {
        foreignKey: "billingContactId",
        as: "billingContact",
      });

      Proposal.belongsTo(models.Inquiry, {
        foreignKey: "inquiryId",
        as: "inquiry",
      });
    }
  }
  Proposal.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      leadId: DataTypes.UUID,
      leadContactId: DataTypes.INTEGER,
      billingContactId: DataTypes.INTEGER,
      inquiryId: DataTypes.UUID,
      issuedById: DataTypes.INTEGER,
      issuedById: DataTypes.INTEGER,
      code: DataTypes.STRING,
      runningNumber: DataTypes.INTEGER,
      version: DataTypes.INTEGER,
      year: DataTypes.INTEGER,
      status: DataTypes.STRING,
      remarks: DataTypes.TEXT,
      metaData: DataTypes.JSONB,
      histories: DataTypes.JSONB,
      sendedAt: DataTypes.DATE,
      verifiedAt: DataTypes.DATE,
      acceptedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Proposal",
    }
  );
  return Proposal;
};
