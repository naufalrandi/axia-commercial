"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Consultancy extends Model {
    static associate(models) {
      Consultancy.belongsTo(models.Inquiry, {
        foreignKey: "inquiryId",
        as: "inquiry",
      });

      Consultancy.belongsToMany(models.BusinessProcess, {
        through: models.ConsultancyBusinessProcess,
        foreignKey: "consultancyId",
        otherKey: "businessProcessId",
        as: "businessProcesses",
      });

      Consultancy.hasMany(models.CertificationAddon, {
        foreignKey: "consultancyId",
        as: "certificationAddons",
      });

      Consultancy.hasOne(models.ConsulDeliveryMethod, {
        foreignKey: "consultancyId",
        as: "deliveryMethod",
      });

      Consultancy.hasMany(models.ConsulDeliverable, {
        foreignKey: "consultancyId",
        as: "deliverables",
      });

      Consultancy.hasOne(models.ConsulInvestmentFees, {
        foreignKey: "consultancyId",
        as: "investmentFees",
      });

      Consultancy.hasOne(models.ConsulAppendix, {
        foreignKey: "consultancyId",
        as: "appendix",
      });

      Consultancy.hasOne(models.ConsulFinancialPlan, {
        foreignKey: "consultancyId",
        as: "financialPlan",
      });
    }
  }
  Consultancy.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      inquiryId: DataTypes.UUID,
      consultancyMethodId: DataTypes.INTEGER,
      estimateStartDate: DataTypes.DATE,
      serviceDuration: DataTypes.INTEGER,
      withCertification: DataTypes.BOOLEAN,
      standards: DataTypes.JSONB,
      termAndConditions: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "Consultancy",
    }
  );
  return Consultancy;
};
