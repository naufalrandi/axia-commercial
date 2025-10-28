'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BusinessProcessLeadLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BusinessProcessLeadLocation.belongsTo(models.BusinessProcess, {
        foreignKey: 'businessProcessId',
        as: 'businessProcess'
      });
      
      BusinessProcessLeadLocation.belongsTo(models.LeadLocation, {
        foreignKey: 'leadLocationId',
        as: 'leadLocation'
      });
    }
  }
  BusinessProcessLeadLocation.init({
    businessProcessId: DataTypes.INTEGER,
    leadLocationId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'BusinessProcessLeadLocation',
    tableName: 'BusinessProcessLeadLocations',
  });
  return BusinessProcessLeadLocation;
};