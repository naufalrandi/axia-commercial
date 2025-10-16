"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserBankAccount extends Model {
    static associate(models) {
      UserBankAccount.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });

      UserBankAccount.belongsTo(models.BankAccount, {
        foreignKey: "bankAccountId",
        as: "bankAccount",
        onDelete: "CASCADE",
      });
    }
  }

  UserBankAccount.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      bankAccountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "BankAccounts",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "UserBankAccount",
      tableName: "UserBankAccounts",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["userId", "bankAccountId"],
          name: "user_bank_accounts_user_id_bank_account_id_unique",
        },
      ],
    }
  );

  return UserBankAccount;
};
