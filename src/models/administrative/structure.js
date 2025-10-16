"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Structure extends Model {
    static associate(models) {
      Structure.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
      });

      Structure.belongsTo(models.Structure, {
        foreignKey: "parentId",
        as: "parent",
      });

      Structure.hasMany(models.Structure, {
        foreignKey: "parentId",
        as: "children",
        onDelete: "CASCADE",
      });

      Structure.hasMany(models.Role, {
        foreignKey: "structureId",
        as: "roles",
        onDelete: "CASCADE",
      });
    }
  }
  Structure.init(
    {
      companyId: DataTypes.UUID,
      parentId: DataTypes.INTEGER,
      employmentLevelId: DataTypes.INTEGER,
      hierarchy: DataTypes.STRING,
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      sorting: DataTypes.INTEGER,
      icon: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Structure",
    }
  );
  return Structure;
};
