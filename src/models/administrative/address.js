"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      //
    }

    // Instance method to get full address string
    getFullAddress() {
      const parts = [];

      if (this.name) parts.push(this.name);
      if (this.addressLine) parts.push(this.addressLine);

      // Add geographical information when available
      if (this.village && this.village.name) parts.push(this.village.name);
      if (this.district && this.district.name) parts.push(this.district.name);
      if (this.city && this.city.name) parts.push(this.city.name);
      if (this.country && this.country.name) parts.push(this.country.name);

      if (this.postalCode) parts.push(this.postalCode);

      return parts.join(", ");
    }

    // Static method to search addresses by location
    static async findByLocation(locationParams) {
      const where = {};

      if (locationParams.countryId) where.countryId = locationParams.countryId;
      if (locationParams.cityId) where.cityId = locationParams.cityId;
      if (locationParams.districtId)
        where.districtId = locationParams.districtId;
      if (locationParams.villageId) where.villageId = locationParams.villageId;
      if (locationParams.postalCode)
        where.postalCode = locationParams.postalCode;

      return await this.findAll({ where });
    }
  }

  Address.init(
    {
      villageId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: "Villages",
          key: "id",
        },
      },
      districtId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: "Districts",
          key: "id",
        },
      },
      cityId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: "Cities",
          key: "id",
        },
      },
      countryId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: "Countries",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [0, 255],
        },
      },
      addressLine: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [0, 500],
        },
      },
      postalCode: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [0, 20],
          isPostalCode(value) {
            if (value) {
              // Basic postal code validation (alphanumeric with optional spaces/hyphens)
              const cleanValue = value.replace(/[\s\-]/g, "");
              if (!/^[A-Za-z0-9]{3,10}$/.test(cleanValue)) {
                throw new Error(
                  "Postal code must be 3-10 alphanumeric characters"
                );
              }
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Address",
      tableName: "Addresses",
      timestamps: true,
      indexes: [
        {
          fields: ["villageId"],
        },
        {
          fields: ["districtId"],
        },
        {
          fields: ["cityId"],
        },
        {
          fields: ["countryId"],
        },
        {
          fields: ["postalCode"],
        },
        {
          // Composite index for geographical hierarchy queries
          fields: ["countryId", "cityId", "districtId", "villageId"],
          name: "addresses_geographical_hierarchy_idx",
        },
        {
          // Index for address search
          fields: ["name"],
        },
      ],
      hooks: {
        beforeValidate: (address) => {
          // Trim whitespace from string fields
          if (address.name) {
            address.name = address.name.trim();
          }
          if (address.addressLine) {
            address.addressLine = address.addressLine.trim();
          }
          if (address.postalCode) {
            address.postalCode = address.postalCode.trim().toUpperCase();
          }
        },
      },
    }
  );

  return Address;
};
