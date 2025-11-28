"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Projects", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      leadId: {
        type: Sequelize.UUID,
      },
      serviceId: {
        type: Sequelize.INTEGER,
      },
      proposalId: {
        type: Sequelize.UUID,
      },
      consultancyId: {
        type: Sequelize.UUID,
      },
      inquiryTrainingId: {
        type: Sequelize.UUID,
      },
      trainingId: {
        type: Sequelize.UUID,
      },
      runningNumber: {
        type: Sequelize.INTEGER,
      },
      code: {
        type: Sequelize.STRING,
      },
      status: {
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
    await queryInterface.dropTable("Projects");
  },
};
