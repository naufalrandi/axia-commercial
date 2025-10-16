const model = require("../../models/index");
const {
  searchData,
  pagination,
  getDataById,
  checkUniqueness,
  updateWithHistory,
  createContractHistoryEntry,
  checkStatus,
  generateContractTemplateCode,
  getUser,
} = require("../../helpers/func");
const { Op, sequelize } = require("sequelize");
const db = require("../../models/index");
const validate = require("../../validations/validation");
const {
  createValidation,
  updateValidation,
  deleteManyValidation,
  approveValidation,
  rejectValidation,
} = require("../../validations/compliance/contract-template-validation");
const { asArray, CONTRACT_TEMPLATE_STATUSES } = require("../../enum/utils");
const documentReviewService = require("./document-review-service");

const getData = async (id) => {
  return await getDataById(
    "ContractTemplate",
    id,
    "Contract template not found"
  );
};

const getAll = async (data) => {
  const { page, limit, offset, orderby, sortBy, search } = data;
  const fieldSearch = searchData(["code", "status", "reason"], search);

  const result = await model.ContractTemplate.findAndCountAll({
    where: {
      ...fieldSearch,
    },
    include: [
      // Uncomment when related models are available
      // {
      //   model: model.ContractVariant,
      //   as: 'contractVariant',
      //   attributes: ['id', 'name']
      // },
      // {
      //   model: model.User,
      //   as: 'approver',
      //   attributes: ['id', 'name', 'email']
      // },
      // {
      //   model: model.User,
      //   as: 'createdBy',
      //   attributes: ['id', 'name', 'email']
      // }
    ],
    limit,
    offset,
    order: [[sortBy, orderby]],
  });

  return pagination(result, page, limit);
};

const create = async (data) => {
  data = validate(createValidation, data);
  const user = await getUser(data.createdById);

  data.status = CONTRACT_TEMPLATE_STATUSES.DRAFT;
  data.code = await generateContractTemplateCode(data.contractVariantId);
  data.histories = [
    createContractHistoryEntry(
      "created",
      data.createdById,
      user ? user.userDetail?.fullname : "Superadmin",
      "Contract template created"
    ),
  ];

  // Use transaction for atomic operations
  const transaction = await db.sequelize.transaction();

  try {
    const existingData = await model.ContractTemplate.findOne({
      where: { code: data.code },
      transaction,
    });

    if (existingData) {
      throw new Error("Contract template with this category already exists");
    }

    // Extract reviewers before creating contract template
    const reviewers = data.reviewers;
    delete data.reviewers; // Remove reviewers from data before creating contract template

    const contractTemplate = await model.ContractTemplate.create(data, {
      transaction,
    });

    // Create reviews for assigned reviewers if any
    if (reviewers && reviewers.length > 0) {
      await documentReviewService.createBulkReviews(
        "ContractTemplate",
        contractTemplate.id,
        reviewers,
        transaction
      );
    }

    // Commit transaction if everything is successful
    await transaction.commit();
    return contractTemplate;
  } catch (error) {
    // Rollback transaction if any error occurs
    await transaction.rollback();
    throw error;
  }
};

const getOne = async (id) => {
  const contractTemplate = await getData(id);

  // Get reviewers data for this contract template
  const reviewers = await model.DocumentReview.findAll({
    where: {
      reviewableType: "ContractTemplate",
      reviewableId: id,
    },
    order: [["createdAt", "ASC"]],
  });

  // Add reviewers to contract template data
  const result = contractTemplate;
  result.reviewers = reviewers;

  return result;
};

const update = async (id, data) => {
  data.id = id;
  data = validate(updateValidation, data);

  // Use helper function to update with history tracking
  const historyEntry = createContractHistoryEntry(
    "updated",
    data.createdById || 1,
    "Superadmin",
    "Contract template updated"
  );

  return await updateWithHistory("ContractTemplate", id, data, historyEntry);
};

const destroy = async (id) => {
  await getData(id);
  return await model.ContractTemplate.destroy({
    where: { id },
  });
};

const destroyMany = async (data) => {
  data = validate(deleteManyValidation, data);
  return await model.ContractTemplate.destroy({
    where: {
      id: {
        [Op.in]: data.ids,
      },
    },
  });
};

const approve = async (id, approverData) => {
  const data = { id, ...approverData };
  validate(approveValidation, data);

  const existingTemplate = await getData(id);
  const updateData = {
    status: CONTRACT_TEMPLATE_STATUSES.APPROVED,
    approvedAt: new Date(),
    rejectedAt: null,
    reason: data.reason || null,
  };

  const historyEntry = createContractHistoryEntry(
    "approved",
    data.approverId || 1,
    "Superadmin",
    data.reason || "Contract template approved"
  );

  return await updateWithHistory(
    "ContractTemplate",
    id,
    updateData,
    historyEntry
  );
};

const reject = async (id, rejectData) => {
  const data = { id, ...rejectData };
  validate(rejectValidation, data);

  const existingTemplate = await getData(id);

  if (existingTemplate.status === CONTRACT_TEMPLATE_STATUSES.APPROVED) {
    throw new Error(`Contract template has been approved`);
  }

  const updateData = {
    status: CONTRACT_TEMPLATE_STATUSES.REJECTED,
    rejectedAt: new Date(),
    approvedAt: null,
    reason: data.reason,
  };

  const historyEntry = createContractHistoryEntry(
    "rejected",
    data.approverId || 1,
    "System",
    data.reason
  );

  return await updateWithHistory(
    "ContractTemplate",
    id,
    updateData,
    historyEntry
  );
};

const submitForReview = async (id, reviewData) => {
  const data = { id, ...reviewData };
  validate(submitForReviewValidation, data);

  const existingTemplate = await getData(id);
  validateContractTemplateStatus(
    existingTemplate.status,
    CONTRACT_TEMPLATE_STATUSES.PENDING_REVIEW
  );

  const updateData = {
    status: "pending_review",
    reviewers: data.reviewers,
  };

  const historyEntry = createContractHistoryEntry(
    "submitted_for_review",
    data.userId || 1,
    "System",
    "Contract template submitted for review"
  );

  // Create DocumentReview records for each reviewer
  if (data.reviewers && data.reviewers.length > 0) {
    const reviewPromises = data.reviewers.map((reviewer) => {
      return model.DocumentReview.create({
        userId: reviewer.userId,
        reviewableType: "ContractTemplate",
        reviewableId: id,
        status: "pending",
        notes: reviewer.notes || "",
      });
    });

    await Promise.all(reviewPromises);
  }

  return await updateWithHistory(
    "ContractTemplate",
    id,
    updateData,
    historyEntry
  );
};

// Get reviews for a contract template
const getReviews = async (id) => {
  await getData(id); // Validate contract template exists

  return await model.DocumentReview.findAll({
    where: {
      reviewableType: "ContractTemplate",
      reviewableId: id,
    },
    order: [["createdAt", "ASC"]],
  });
};

// Get review statistics for a contract template
const getReviewStatistics = async (id) => {
  await getData(id); // Validate contract template exists

  const { getReviewStatistics } = require("../../helpers/func");
  return await getReviewStatistics("ContractTemplate", id);
};

// Check if all reviews are completed for a contract template
const areReviewsCompleted = async (id) => {
  await getData(id); // Validate contract template exists

  const { areAllReviewsCompleted } = require("../../helpers/func");
  return await areAllReviewsCompleted("ContractTemplate", id);
};

module.exports = {
  getAll,
  create,
  getOne,
  update,
  destroy,
  destroyMany,
  approve,
  reject,
  submitForReview,
  getReviews,
  getReviewStatistics,
  areReviewsCompleted,
};
