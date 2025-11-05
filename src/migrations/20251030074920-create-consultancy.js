"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Consultancies", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      inquiryId: {
        type: Sequelize.UUID,
      },
      consultancyMethodId: {
        type: Sequelize.INTEGER,
      },
      estimateStartDate: {
        type: Sequelize.DATE,
      },
      serviceDuration: {
        type: Sequelize.INTEGER,
      },
      withCertification: {
        type: Sequelize.BOOLEAN,
      },
      standards: {
        type: Sequelize.JSONB,
      },
      termAndConditions: {
        type: Sequelize.JSONB,
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
    await queryInterface.dropTable("Consultancies");
  },
};
