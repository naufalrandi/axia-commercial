"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Lead extends Model {
    static associate(models) {
      // define association here
      Lead.hasMany(models.LeadLocation, {
        foreignKey: "leadId",
        as: "locations",
        onDelete: "CASCADE",
      });

      Lead.hasMany(models.LeadContact, {
        foreignKey: "leadId",
        as: "contacts",
        onDelete: "CASCADE",
      });

      Lead.hasMany(models.LeadBillingContact, {
        foreignKey: "leadId",
        as: "billingContacts",
        onDelete: "CASCADE",
      });

      Lead.hasMany(models.BusinessProcess, {
        foreignKey: "leadId",
        as: "businessProcesses",
        onDelete: "CASCADE",
      });
    }
  }
  Lead.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      legalEntityTypeId: DataTypes.STRING,
      runningNumber: DataTypes.INTEGER,
      code: DataTypes.STRING,
      name: DataTypes.STRING,
      taxNumber: DataTypes.STRING,
      website: DataTypes.STRING,
      iafCodes: {
        type: DataTypes.JSONB,
        get() {
          const rawValue = this.getDataValue("iafCodes");
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
          this.setDataValue("iafCodes", JSON.stringify(value || []));
        },
      },
    },
    {
      sequelize,
      modelName: "Lead",
    }
  );
  return Lead;
};
