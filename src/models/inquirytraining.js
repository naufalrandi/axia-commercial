"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class InquiryTraining extends Model {
    static associate(models) {
      InquiryTraining.hasMany(models.Training, {
        foreignKey: "inquiryTrainingId",
        as: "trainings",
      });

      InquiryTraining.hasOne(models.TrainInvestmentFees, {
        foreignKey: "inquiryTrainingId",
        as: "investmentFees",
      });

      InquiryTraining.hasOne(models.TrainAppendix, {
        foreignKey: "inquiryTrainingId",
        as: "appendix",
      });

      InquiryTraining.hasMany(models.TrainFinancialPlan, {
        foreignKey: "inquiryTrainingId",
        as: "financialPlans",
      });
    }
  }
  InquiryTraining.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      inquiryId: DataTypes.UUID,
      termsAndConditions: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "InquiryTraining",
    }
  );
  return InquiryTraining;
};
