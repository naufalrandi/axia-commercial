"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DocumentReview extends Model {
    static associate(models) {
      // No direct association with User model since it's in different service
      // userId will be used to reference user from external service
      // Polymorphic associations will be defined in individual models
      // This allows DocumentReview to belong to ContractTemplate, Document, etc.
    }

    // Instance method to get the associated reviewable item
    getReviewableItem() {
      const ModelClass = sequelize.models[this.reviewableType];
      if (ModelClass) {
        return ModelClass.findByPk(this.reviewableId);
      }
      return null;
    }

    // Static method to create review with polymorphic relationship
    static async createReview(
      userId,
      reviewableType,
      reviewableId,
      additionalData = {}
    ) {
      return await this.create({
        userId,
        reviewableType,
        reviewableId,
        status: "pending",
        ...additionalData,
      });
    }
  }

  DocumentReview.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID of the user from external User service",
      },
      reviewableType: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "The model name (e.g., ContractTemplate, Document, etc.)",
      },
      reviewableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "The ID of the reviewable item",
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reviewAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "DocumentReview",
    }
  );

  return DocumentReview;
};
