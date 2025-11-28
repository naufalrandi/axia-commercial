"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Milestones", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Projects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      deliverableId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "ConsulDeliverables",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      date: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING,
      },
      comments: {
        type: Sequelize.JSONB,
      },
      reason: {
        type: Sequelize.TEXT,
      },
      files: {
        type: Sequelize.JSONB,
      },
      approvedBy: {
        type: Sequelize.JSONB,
      },
      logs: {
        type: Sequelize.JSONB,
      },
      isKickoff: {
        type: Sequelize.BOOLEAN,
      },
      isClossing: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable("Milestones");
  },
};
