"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LeadLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LeadLocation.belongsTo(models.Lead, {
        foreignKey: "leadId",
        as: "lead",
      });
    }
  }
  LeadLocation.init(
    {
      leadId: DataTypes.UUID,
      addressId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "LeadLocation",
    }
  );
  return LeadLocation;
};
