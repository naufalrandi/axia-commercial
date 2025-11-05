'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TrainingClasses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      trainingId: {
        type: Sequelize.UUID
      },
      class: {
        type: Sequelize.INTEGER
      },
      participant: {
        type: Sequelize.INTEGER
      },
      deliveryMethod: {
        type: Sequelize.STRING
      },
      startDate: {
        type: Sequelize.DATE
      },
      enddate: {
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
    await queryInterface.dropTable('TrainingClasses');
  }
};