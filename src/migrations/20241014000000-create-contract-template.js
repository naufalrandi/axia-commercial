"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ContractTemplates", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      contractVariantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      approverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdById: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      standardClauses: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: null,
      },
      histories: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: "[]",
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      rejectedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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

    // Add indexes for better performance
    await queryInterface.addIndex("ContractTemplates", ["contractVariantId"]);
    await queryInterface.addIndex("ContractTemplates", ["approverId"]);
    await queryInterface.addIndex("ContractTemplates", ["createdById"]);
    await queryInterface.addIndex("ContractTemplates", ["status"]);
    await queryInterface.addIndex("ContractTemplates", ["code"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ContractTemplates");
  },
};
