"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ContractTemplate extends Model {
    static associate(models) {
      // define association here
      // ContractTemplate.belongsTo(models.ContractVariant, {
      //   foreignKey: 'contractVariantId',
      //   as: 'contractVariant'
      // });
      // ContractTemplate.belongsTo(models.User, {
      //   foreignKey: 'approverId',
      //   as: 'approver'
      // });
      // ContractTemplate.belongsTo(models.User, {
      //   foreignKey: 'createdById',
      //   as: 'createdBy'
      // });

      // Polymorphic association with DocumentReview
      ContractTemplate.hasMany(models.DocumentReview, {
        foreignKey: "reviewableId",
        constraints: false,
        scope: {
          reviewableType: "ContractTemplate",
        },
        as: "reviews",
      });
    }

    // Instance method to create a review for this contract template
    async createReview(userId, additionalData = {}) {
      const { DocumentReview } = require("./index");
      return await DocumentReview.createReview(
        userId,
        "ContractTemplate",
        this.id,
        additionalData
      );
    }

    // Instance method to get all reviews for this contract template
    async getReviews(status = null) {
      const { DocumentReview } = require("./index");
      const whereClause = {
        reviewableType: "ContractTemplate",
        reviewableId: this.id,
      };

      if (status) {
        whereClause.status = status;
      }

      return await DocumentReview.findAll({
        where: whereClause,
        order: [["createdAt", "ASC"]],
      });
    }

    // Instance method to check if all required reviews are completed
    async areReviewsCompleted() {
      const pendingReviews = await this.getReviews("pending");
      const inProgressReviews = await this.getReviews("in_progress");

      return pendingReviews.length === 0 && inProgressReviews.length === 0;
    }
  }

  ContractTemplate.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      contractVariantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      approverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdById: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      standardClauses: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: null,
      },
      histories: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejectedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ContractTemplate",
      timestamps: true,
      underscored: false,
    }
  );

  return ContractTemplate;
};
