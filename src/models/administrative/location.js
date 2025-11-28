"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Location.belongsTo(models.User, {
        foreignKey: "picId",
        as: "pic",
        onDelete: "SET NULL",
      });

      Location.belongsTo(models.Address, {
        foreignKey: "addressId",
        as: "address",
        onDelete: "SET NULL",
      });
    }
  }
  Location.init(
    {
      picId: DataTypes.INTEGER,
      addressId: DataTypes.INTEGER,
      type: DataTypes.STRING,
      primary: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Location",
    }
  );
  return Location;
};
