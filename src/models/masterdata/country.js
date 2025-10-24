"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    static associate(models) {
      Country.belongsToMany(models.Language, {
        through: "CountryLanguages",
        foreignKey: "countryId",
        otherKey: "languageId",
        as: "languages",
        onDelete: "CASCADE",
      });

      Country.belongsToMany(models.Currency, {
        through: "CountryCurrencies",
        foreignKey: "countryId",
        otherKey: "currencyId",
        as: "currencies",
        onDelete: "CASCADE",
      });

      Country.hasMany(models.Province, {
        foreignKey: "countryId",
        as: "provinces",
      });
    }
  }
  Country.init(
    {
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      cca2: DataTypes.STRING,
      cca3: DataTypes.STRING,
      capital: DataTypes.JSONB,
      region: DataTypes.STRING,
      subregion: DataTypes.STRING,
      latlng: DataTypes.JSONB,
      flag: DataTypes.STRING,
      nationalities: DataTypes.JSONB,
      callingCodes: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "Country",
    }
  );
  return Country;
};
