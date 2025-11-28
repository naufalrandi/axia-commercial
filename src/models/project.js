"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      Project.belongsTo(models.Lead, {
        foreignKey: "leadId",
        as: "lead",
      });

      Project.belongsTo(models.Proposal, {
        foreignKey: "proposalId",
        as: "proposal",
      });

      Project.belongsTo(models.Consultancy, {
        foreignKey: "consultancyId",
        as: "consultancy",
      });

      Project.belongsTo(models.InquiryTraining, {
        foreignKey: "inquiryTrainingId",
        as: "inquiryTraining",
      });

      Project.belongsTo(models.Training, {
        foreignKey: "trainingId",
        as: "training",
      });

      Project.hasMany(models.TeamRoster, {
        foreignKey: "projectId",
        as: "teamRosters",
      });

      Project.hasMany(models.Milestone, {
        foreignKey: "projectId",
        as: "milestones",
      });

      Project.hasMany(models.ActivityLog, {
        foreignKey: "projectId",
        as: "activityLogs",
      });

      Project.hasMany(models.WorkOrder, {
        foreignKey: "projectId",
        as: "workOrders",
      });
    }
  }
  Project.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      leadId: DataTypes.UUID,
      serviceId: DataTypes.INTEGER,
      proposalId: DataTypes.UUID,
      consultancyId: DataTypes.UUID,
      inquiryTrainingId: DataTypes.UUID,
      trainingId: DataTypes.UUID,
      runningNumber: DataTypes.INTEGER,
      code: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Project",
    }
  );
  return Project;
};
