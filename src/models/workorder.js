"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class WorkOrder extends Model {
    static associate(models) {
      // define association here
    }
  }
  WorkOrder.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      projectId: DataTypes.UUID,
      runningNumber: DataTypes.INTEGER,
      version: DataTypes.INTEGER,
      code: DataTypes.STRING,
      issueDate: DataTypes.DATE,
      issuerId: DataTypes.INTEGER,
      serviceId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      standards: DataTypes.JSONB,
      role: DataTypes.STRING,
      duration: DataTypes.FLOAT,
      taskMilestones: DataTypes.JSONB,
      otherInformation: DataTypes.TEXT,
      innerCityTravel: DataTypes.JSONB,
      interCityTravel: DataTypes.JSONB,
      accomodation: DataTypes.JSONB,
      meals: DataTypes.JSONB,
      personalProtectiveEquipment: DataTypes.JSONB,
      accessClearance: DataTypes.JSONB,
      rate: DataTypes.DECIMAL,
      totalRate: DataTypes.DECIMAL,
      incomeTaxDeducation: DataTypes.DECIMAL,
      totalFeesPaid: DataTypes.DECIMAL,
      paymentTermAndCondition: DataTypes.JSONB,
      status: DataTypes.STRING,
      reason: DataTypes.TEXT,
      acceptedAt: DataTypes.DATE,
      acceptanceLogs: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "WorkOrder",
    }
  );
  return WorkOrder;
};
