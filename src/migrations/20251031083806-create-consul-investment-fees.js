'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ConsulInvestmentFees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      consultancyId: {
        type: Sequelize.UUID
      },
      details: {
        type: Sequelize.JSONB
      },
      subTotal: {
        type: Sequelize.BIGINT
      },
      discount: {
        type: Sequelize.FLOAT
      },
      discountAmount: {
        type: Sequelize.BIGINT
      },
      vat: {
        type: Sequelize.FLOAT
      },
      vatAmount: {
        type: Sequelize.BIGINT
      },
      tax: {
        type: Sequelize.FLOAT
      },
      taxAmount: {
        type: Sequelize.BIGINT
      },
      grandTotal: {
        type: Sequelize.BIGINT
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
    await queryInterface.dropTable('ConsulInvestmentFees');
  }
};