"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TrainInvestmentFees extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TrainInvestmentFees.init(
    {
      inquiryTrainingId: DataTypes.UUID,
      details: DataTypes.JSONB,
      subTotal: DataTypes.BIGINT,
      discount: DataTypes.FLOAT,
      discountAmount: DataTypes.BIGINT,
      vat: DataTypes.FLOAT,
      vatAmount: DataTypes.BIGINT,
      tax: DataTypes.FLOAT,
      taxAmount: DataTypes.BIGINT,
      grandTotal: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "TrainInvestmentFees",
    }
  );
  return TrainInvestmentFees;
};
