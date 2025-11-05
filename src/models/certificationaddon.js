"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CertificationAddon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CertificationAddon.init(
    {
      consultancyId: DataTypes.UUID,
      supplierId: DataTypes.UUID,
      address: DataTypes.TEXT,
      details: {
        type: DataTypes.JSONB,
        get() {
          const rawValue = this.getDataValue("details");
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          this.setDataValue("details", JSON.stringify(value));
        },
      },
    },
    {
      sequelize,
      modelName: "CertificationAddon",
    }
  );
  return CertificationAddon;
};
