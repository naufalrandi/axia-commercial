'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ConsulDeliveryMethods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      consultancyId: {
        type: Sequelize.UUID
      },
      osCondition: {
        type: Sequelize.STRING
      },
      osSessionAmount: {
        type: Sequelize.INTEGER
      },
      osSessionUnit: {
        type: Sequelize.STRING
      },
      vcCondition: {
        type: Sequelize.STRING
      },
      vcSessionAmount: {
        type: Sequelize.INTEGER
      },
      vcSessionUnit: {
        type: Sequelize.STRING
      },
      textCommunication: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('ConsulDeliveryMethods');
  }
};