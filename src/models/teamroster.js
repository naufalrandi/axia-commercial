"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TeamRoster extends Model {
    static associate(models) {
      TeamRoster.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });
    }
  }
  TeamRoster.init(
    {
      projectId: DataTypes.UUID,
      consultantId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "TeamRoster",
    }
  );
  return TeamRoster;
};
