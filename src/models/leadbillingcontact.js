"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LeadBillingContact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LeadBillingContact.belongsTo(models.Lead, {
        foreignKey: "leadId",
        as: "lead",
      });
    }
  }
  LeadBillingContact.init(
    {
      leadId: DataTypes.UUID,
      addressId: DataTypes.INTEGER,
      fullname: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      email: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "LeadBillingContact",
    }
  );
  return LeadBillingContact;
};
