"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.Action, {
        through: models.RoleAction,
        foreignKey: "roleId",
        otherKey: "actionId",
        as: "actions",
        onDelete: "CASCADE",
      });

      Role.belongsToMany(models.Menu, {
        through: models.RoleMenu,
        foreignKey: "roleId",
        otherKey: "menuId",
        as: "menus",
        onDelete: "CASCADE",
      });
    }
  }
  Role.init(
    {
      structureId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      structureLabel: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Role",
    }
  );
  return Role;
};
