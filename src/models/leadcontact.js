"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LeadContact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LeadContact.belongsTo(models.Lead, {
        foreignKey: "leadId",
        as: "lead",
      });
    }
  }
  LeadContact.init(
    {
      leadId: DataTypes.UUID,
      fullname: DataTypes.STRING,
      designation: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      email: DataTypes.STRING,
      source: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "LeadContact",
    }
  );
  return LeadContact;
};
