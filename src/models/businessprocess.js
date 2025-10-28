'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BusinessProcess extends Model {
    static associate(models) {
      // define association here
      BusinessProcess.belongsTo(models.Lead, {
        foreignKey: 'leadId',
        as: 'lead'
      });

      BusinessProcess.belongsToMany(models.LeadLocation, {
        through: models.BusinessProcessLeadLocation,
        foreignKey: 'businessProcessId',
        otherKey: 'leadLocationId',
        as: 'leadLocations'
      });
    }
  }
  BusinessProcess.init({
    leadId: DataTypes.UUID,
    name: DataTypes.STRING,
    processFunctions: {
        type: DataTypes.JSONB,
        get() {
          const rawValue = this.getDataValue("processFunctions");
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          this.setDataValue("processFunctions", JSON.stringify(value));
        },
      },
  }, {
    sequelize,
    modelName: 'BusinessProcess',
  });
  return BusinessProcess;
};