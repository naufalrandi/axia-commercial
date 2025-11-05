"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Trainings", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      inquiryTrainingId: {
        type: Sequelize.UUID,
      },
      trainingCourseId: {
        type: Sequelize.UUID,
      },
      runningNumber: {
        type: Sequelize.INTEGER,
      },
      code: {
        type: Sequelize.STRING,
      },
      courseMaterialFormat: {
        type: Sequelize.STRING,
      },
      certificateFormat: {
        type: Sequelize.STRING,
      },
      courseType: {
        type: Sequelize.STRING,
      },
      issuer: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Trainings");
  },
};
