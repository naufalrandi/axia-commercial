"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ConsulDeliverables", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      consultancyId: {
        type: Sequelize.UUID,
      },
      consultancyProgramId: {
        type: Sequelize.INTEGER,
      },
      activities: {
        type: Sequelize.JSONB,
      },
      output: {
        type: Sequelize.JSONB,
      },
      estimateDuration: {
        type: Sequelize.STRING,
      },
      position: {
        type: Sequelize.INTEGER,
      },
      month: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("ConsulDeliverables");
  },
};
