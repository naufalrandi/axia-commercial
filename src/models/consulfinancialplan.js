"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ConsulFinancialPlan extends Model {
    static associate(models) {
      ConsulFinancialPlan.hasMany(models.Incentive, {
        foreignKey: "financialPlanId",
        as: "incentives",
      });

      ConsulFinancialPlan.hasMany(models.PersonnelCost, {
        foreignKey: "financialPlanId",
        as: "personnelCosts",
      });

      ConsulFinancialPlan.hasMany(models.NonpersonnelCost, {
        foreignKey: "financialPlanId",
        as: "nonpersonnelCosts",
      });
    }
  }
  ConsulFinancialPlan.init(
    {
      consultancyId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "ConsulFinancialPlan",
    }
  );
  return ConsulFinancialPlan;
};
