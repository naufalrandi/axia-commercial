"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserDetail extends Model {
    static associate(models) {
      // Define association with User model
      UserDetail.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });

      // Define associations with Address model
      UserDetail.belongsTo(models.Address, {
        foreignKey: "addressId",
        as: "address",
        onDelete: "SET NULL",
      });

      UserDetail.belongsTo(models.Address, {
        foreignKey: "currentAddressId",
        as: "currentAddress",
        onDelete: "SET NULL",
      });

      // Note: Relasi ke masterdata models (Country, City, etc) tidak didefinisikan di sini
      // karena model masterdata berada di folder terpisah dan tidak dapat diakses dari sini.
      // Foreign key tetap ada di database untuk referential integrity,
      // tetapi join harus dilakukan manual di service layer jika diperlukan.
    }
  }
  
  UserDetail.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      nationalityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pobCountryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pobCityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      addressId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      currentAddressId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 255],
        },
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 100],
        },
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isIn: [["M", "F", "Male", "Female", "Other"]],
        },
      },
      nationalIdentityNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          len: [1, 50],
        },
      },
      taxpayerIdentificationNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          len: [1, 50],
        },
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: true,
          isBefore: new Date().toISOString().split("T")[0], // Must be before today
        },
      },
      religion: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 100],
        },
      },
      eyeColor: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [1, 50],
        },
      },
      bodyHeight: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          max: 300, // cm
        },
      },
      bodyWeight: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          max: 1000, // kg
        },
      },
      bloodType: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isIn: [["A", "B", "AB", "O", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
        },
      },
      personalContacts: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        validate: {
          isValidContactsJSON(value) {
            if (value && !Array.isArray(value)) {
              throw new Error("Personal contacts must be an array");
            }
          },
        },
      },
      personalEmails: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        validate: {
          isValidEmailsJSON(value) {
            if (value && !Array.isArray(value)) {
              throw new Error("Personal emails must be an array");
            }
          },
        },
      },
      emergencyContacts: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        validate: {
          isValidEmergencyJSON(value) {
            if (value && !Array.isArray(value)) {
              throw new Error("Emergency contacts must be an array");
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "UserDetail",
      tableName: "UserDetails",
      timestamps: true,
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["nationalIdentityNumber"],
          unique: true,
          where: {
            nationalIdentityNumber: {
              [sequelize.Sequelize.Op.ne]: null,
            },
          },
        },
        {
          fields: ["taxpayerIdentificationNumber"],
          unique: true,
          where: {
            taxpayerIdentificationNumber: {
              [sequelize.Sequelize.Op.ne]: null,
            },
          },
        },
      ],
    }
  );
  
  return UserDetail;
};