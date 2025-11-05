"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ConsulAppendixes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      consultancyId: {
        type: Sequelize.UUID,
      },
      paymentTerms: {
        type: Sequelize.JSONB,
      },
      innerCityTransportation: {
        type: Sequelize.STRING,
      },
      interCityTransportation: {
        type: Sequelize.STRING,
      },
      accomodation: {
        type: Sequelize.STRING,
      },
      onsiteMeals: {
        type: Sequelize.STRING,
      },
      offsiteMeals: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("ConsulAppendixes");
  },
};
