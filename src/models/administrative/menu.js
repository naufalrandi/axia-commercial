'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    static associate(models) {
      Menu.hasMany(models.Menu, {
        foreignKey: "parentId",
        as: "subMenu"
      })

      Menu.hasMany(models.Action, {
        foreignKey: "menuId",
        as: "actions",
        onDelete: "CASCADE"
      })
    }
  }
  Menu.init({
    parentId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    heading: DataTypes.STRING,
    route: DataTypes.STRING,
    routeSeo: DataTypes.STRING,
    icon: DataTypes.STRING,
    sorting: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Menu',
  });
  return Menu;
};