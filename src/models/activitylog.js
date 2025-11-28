"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    static associate(models) {
      ActivityLog.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });
    }
  }
  ActivityLog.init(
    {
      projectId: DataTypes.UUID,
      users: DataTypes.JSONB,
      consultancyPrograms: DataTypes.JSONB,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      remarks: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "ActivityLog",
    }
  );
  return ActivityLog;
};
