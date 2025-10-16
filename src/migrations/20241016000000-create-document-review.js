"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DocumentReviews", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      reviewableType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      reviewableId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      reviewAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex("DocumentReviews", ["userId"]);
    await queryInterface.addIndex("DocumentReviews", [
      "reviewableType",
      "reviewableId",
    ]);
    await queryInterface.addIndex("DocumentReviews", ["status"]);
    await queryInterface.addIndex("DocumentReviews", ["reviewAt"]);

    // Add composite index for polymorphic queries
    await queryInterface.addIndex("DocumentReviews", [
      "reviewableType",
      "reviewableId",
      "status",
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("DocumentReviews");
  },
};
