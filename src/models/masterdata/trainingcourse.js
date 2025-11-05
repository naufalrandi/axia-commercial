"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TrainingCourse extends Model {
    static associate(models) {
      TrainingCourse.belongsToMany(models.Standard, {
        through: "TrainingCourseStandards",
        foreignKey: "trainingCourseId",
        otherKey: "standardId",
        as: "standards",
      });
    }
  }
  TrainingCourse.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      runningNumber: DataTypes.INTEGER,
      code: DataTypes.STRING,
      courseTier: DataTypes.STRING,
      courseGroup: DataTypes.STRING,
      courseTitle: DataTypes.STRING,
      maxAttendance: DataTypes.INTEGER,
      courseDuration: DataTypes.FLOAT,
      rate: DataTypes.BIGINT,
      prerequisites: DataTypes.JSONB,
      courseOutline: DataTypes.JSONB,
      exam: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "TrainingCourse",
    }
  );
  return TrainingCourse;
};
