"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LeadLocation extends Model {
    static associate(models) {
      // define association here
      LeadLocation.belongsTo(models.Lead, {
        foreignKey: "leadId",
        as: "lead",
      });

      LeadLocation.belongsToMany(models.BusinessProcess, {
        through: models.BusinessProcessLeadLocation,
        foreignKey: "leadLocationId",
        otherKey: "businessProcessId",
        as: "businessProcesses",
      });
    }
  }
  LeadLocation.init(
    {
      leadId: DataTypes.UUID,
      addressId: DataTypes.INTEGER,
      primary: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "LeadLocation",
    }
  );
  return LeadLocation;
};
