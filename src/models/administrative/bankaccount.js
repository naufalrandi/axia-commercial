"use strict";
const { Model } = require("sequelize");
const { ACCOUNT_TYPE, asArray } = require("../../enum/utils");

module.exports = (sequelize, DataTypes) => {
  class BankAccount extends Model {
    static associate(models) {
      // Define association with Bank model when it exists
      // Note: Bank model is in masterdata database, so we handle it manually in service layer

      BankAccount.belongsToMany(models.User, {
        through: models.UserBankAccount,
        foreignKey: "bankAccountId",
        otherKey: "userId",
        as: "users",
      });
    }
  }

  BankAccount.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      bankId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Banks",
          key: "id",
        },
      },
      accountHolder: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 50],
          isAlphanumeric: false, // Allow special characters like hyphens
          customValidator(value) {
            // Remove spaces and hyphens for validation
            const cleanValue = value.replace(/[\s\-]/g, "");
            if (!/^[0-9]+$/.test(cleanValue)) {
              throw new Error(
                "Account number must contain only numbers, spaces, and hyphens"
              );
            }
            if (cleanValue.length < 8 || cleanValue.length > 20) {
              throw new Error("Account number must be between 8-20 digits");
            }
          },
        },
      },
      accountType: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [0, 50], // Maximum 50 characters for account type
          isIn: {
            args: [asArray(ACCOUNT_TYPE)],
            msg: `Account type must be one of: ${asArray(ACCOUNT_TYPE).join(
              ", "
            )}`,
          },
        },
      },
      bankAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 1000], // Maximum 1000 characters for address
        },
      },
      primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          isBoolean: true,
        },
      },
    },
    {
      sequelize,
      modelName: "BankAccount",
      tableName: "BankAccounts",
      timestamps: true,
      indexes: [
        {
          fields: ["bankId"],
        },
        {
          fields: ["accountNumber"],
          unique: true,
        },
        {
          fields: ["accountHolder"],
        },
        {
          fields: ["accountType"],
        },
      ],
      hooks: {
        beforeValidate: (bankAccount) => {
          // Trim whitespace from string fields
          if (bankAccount.accountHolder) {
            bankAccount.accountHolder = bankAccount.accountHolder.trim();
          }
          if (bankAccount.accountNumber) {
            bankAccount.accountNumber = bankAccount.accountNumber.trim();
          }
          if (bankAccount.accountType) {
            bankAccount.accountType = bankAccount.accountType.trim();
          }
          if (bankAccount.bankAddress) {
            bankAccount.bankAddress = bankAccount.bankAddress.trim();
          }
        },
      },
    }
  );

  return BankAccount;
};
