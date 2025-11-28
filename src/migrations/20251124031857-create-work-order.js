"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("WorkOrders", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      projectId: {
        type: Sequelize.UUID,
      },
      runningNumber: {
        type: Sequelize.INTEGER,
      },
      version: {
        type: Sequelize.INTEGER,
      },
      code: {
        type: Sequelize.STRING,
      },
      issueDate: {
        type: Sequelize.DATE,
      },
      issuerId: {
        type: Sequelize.INTEGER,
      },
      serviceId: {
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      standards: {
        type: Sequelize.JSONB,
      },
      role: {
        type: Sequelize.STRING,
      },
      duration: {
        type: Sequelize.FLOAT,
      },
      taskMilestones: {
        type: Sequelize.JSONB,
      },
      otherInformation: {
        type: Sequelize.TEXT,
      },
      innerCityTravel: {
        type: Sequelize.JSONB,
      },
      interCityTravel: {
        type: Sequelize.JSONB,
      },
      accomodation: {
        type: Sequelize.JSONB,
      },
      meals: {
        type: Sequelize.JSONB,
      },
      personalProtectiveEquipment: {
        type: Sequelize.JSONB,
      },
      accessClearance: {
        type: Sequelize.JSONB,
      },
      rate: {
        type: Sequelize.DECIMAL,
      },
      totalRate: {
        type: Sequelize.DECIMAL,
      },
      incomeTaxDeducation: {
        type: Sequelize.DECIMAL,
      },
      totalFeesPaid: {
        type: Sequelize.DECIMAL,
      },
      paymentTermAndCondition: {
        type: Sequelize.JSONB,
      },
      status: {
        type: Sequelize.STRING,
      },
      reason: {
        type: Sequelize.TEXT,
      },
      acceptedAt: {
        type: Sequelize.DATE,
      },
      acceptanceLogs: {
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
    await queryInterface.dropTable("WorkOrders");
  },
};
