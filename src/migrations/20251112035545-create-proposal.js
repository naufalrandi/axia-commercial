"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Proposals", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      leadId: {
        type: Sequelize.UUID,
      },
      leadContactId: {
        type: Sequelize.INTEGER,
      },
      billingContactId: {
        type: Sequelize.INTEGER,
      },
      inquiryId: {
        type: Sequelize.UUID,
      },
      issuedById: {
        type: Sequelize.INTEGER,
      },
      code: {
        type: Sequelize.STRING,
      },
      runningNumber: {
        type: Sequelize.INTEGER,
      },
      version: {
        type: Sequelize.INTEGER,
      },
      year: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.STRING,
      },
      remarks: {
        type: Sequelize.TEXT,
      },
      metaData: {
        type: Sequelize.JSONB,
      },
      histories: {
        type: Sequelize.JSONB,
      },
      sendedAt: {
        type: Sequelize.DATE,
      },
      verifiedAt: {
        type: Sequelize.DATE,
      },
      acceptedAt: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("Proposals");
  },
};
