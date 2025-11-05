'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Inquiries', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      leadId: {
        type: Sequelize.UUID
      },
      serviceId: {
        type: Sequelize.INTEGER
      },
      salesPersonId: {
        type: Sequelize.INTEGER
      },
      runningNumber: {
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING
      },
      proposalGeneratedAt: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Inquiries');
  }
};