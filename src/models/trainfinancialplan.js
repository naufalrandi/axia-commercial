"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TrainFinancialPlan extends Model {
    static associate(models) {
      TrainFinancialPlan.hasMany(models.Incentive, {
        foreignKey: "financialPlanId",
        as: "incentives",
      });

      TrainFinancialPlan.hasMany(models.PersonnelCost, {
        foreignKey: "financialPlanId",
        as: "personnelCosts",
      });

      TrainFinancialPlan.hasMany(models.NonpersonnelCost, {
        foreignKey: "financialPlanId",
        as: "nonpersonnelCosts",
      });
    }
  }
  TrainFinancialPlan.init(
    {
      inquiryTrainingId: DataTypes.UUID,
      trainingCourseId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "TrainFinancialPlan",
    }
  );
  return TrainFinancialPlan;
};
