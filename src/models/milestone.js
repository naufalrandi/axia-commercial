"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Milestone extends Model {
    static associate(models) {
      Milestone.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });

      Milestone.belongsTo(models.ConsulDeliverable, {
        foreignKey: "deliverableId",
        as: "deliverable",
      });
    }
  }
  Milestone.init(
    {
      projectId: DataTypes.UUID,
      deliverableId: DataTypes.INTEGER,
      date: DataTypes.DATE,
      status: DataTypes.STRING,
      reason: DataTypes.TEXT,
      files: DataTypes.JSONB,
      comments: DataTypes.JSONB,
      approvedBy: DataTypes.JSONB,
      logs: DataTypes.JSONB,
      isKickoff: DataTypes.BOOLEAN,
      isClossing: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Milestone",
    }
  );
  return Milestone;
};
