const model = require("../../models/index");
const {
  searchData,
  pagination,
  getDataById,
  updateWithHistory,
  createContractHistoryEntry,
  generateContractTemplateCode,
  getUser,
  getContractVariant,
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
  const contractTemplate = await getDataById(
    "ContractTemplate",
    id,
    "Contract template not found"
  );

  contractTemplate.contractVariant = await getContractVariant(
    contractTemplate.contractVariantId
  );

  const reviewers = await model.DocumentReview.findAll({
    where: {
      reviewableType: "ContractTemplate",
      reviewableId: id,
    },
    order: [["createdAt", "ASC"]],
  });

  contractTemplate.approver = await getUser(contractTemplate.approverId);
  contractTemplate.reviewers = reviewers;

  return contractTemplate;
};

const getAll = async (data) => {
  const { page, limit, offset, orderby, sortBy, search } = data;
  const fieldSearch = searchData(["code", "status", "reason"], search);

  const result = await model.ContractTemplate.findAndCountAll({
    where: {
      ...fieldSearch,
    },
    limit,
    offset,
    order: [[sortBy, orderby]],
    attributes: { exclude: ["histories"] },
  });

  result.rows = await Promise.all(
    result.rows.map(async (template) => {
      const contractVariant = await getContractVariant(
        template.contractVariantId
      );

      return {
        ...template.toJSON(),
        contractVariant,
      };
    })
  );

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

  const transaction = await db.sequelize.transaction();
  try {
    const existingData = await model.ContractTemplate.findOne({
      where: { code: data.code },
      transaction,
    });

    if (existingData) {
      throw new Error("Contract template with this category already exists");
    }

    const reviewers = data.reviewers;
    delete data.reviewers;
    const contractTemplate = await model.ContractTemplate.create(data, {
      transaction,
    });

    if (reviewers && reviewers.length > 0) {
      await documentReviewService.createBulkReviews(
        "ContractTemplate",
        contractTemplate.id,
        reviewers,
        transaction
      );
    }

    await transaction.commit();
    return contractTemplate;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getOne = async (id) => {
  return await getData(id);
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

const submit = async (id, submitData) => {
  const data = { id, ...submitData };
  validate(approveValidation, data);
  const existingTemplate = await getData(id);

  if (existingTemplate.status === CONTRACT_TEMPLATE_STATUSES.PENDING) {
    throw new Error(`Contract template has already been submitted`);
  }

  if (existingTemplate.status === CONTRACT_TEMPLATE_STATUSES.APPROVED) {
    throw new Error(`Contract template has been approved`);
  }

  if (existingTemplate.status === CONTRACT_TEMPLATE_STATUSES.REJECTED) {
    throw new Error(`Contract template has been rejected`);
  }

  const updateData = {
    status: CONTRACT_TEMPLATE_STATUSES.PENDING,
  };

  const historyEntry = createContractHistoryEntry(
    "submitted",
    data.userId || 1,
    "Superadmin",
    data.reason || "Contract template submitted"
  );

  return await updateWithHistory(
    "ContractTemplate",
    id,
    updateData,
    historyEntry
  );
};

const approve = async (id, approverData) => {
  const data = { id, ...approverData };
  validate(approveValidation, data);
  const existingTemplate = await getData(id);

  if (existingTemplate.status === CONTRACT_TEMPLATE_STATUSES.DRAFT) {
    throw new Error(`Contract template is still in draft status`);
  }

  if (existingTemplate.status === CONTRACT_TEMPLATE_STATUSES.APPROVED) {
    throw new Error(`Contract template has been approved`);
  }

  if (existingTemplate.status === CONTRACT_TEMPLATE_STATUSES.REJECTED) {
    throw new Error(`Contract template has been rejected`);
  }

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

  if (existingTemplate.status === CONTRACT_TEMPLATE_STATUSES.DRAFT) {
    throw new Error(`Contract template is still in draft status`);
  }

  if (existingTemplate.status === CONTRACT_TEMPLATE_STATUSES.APPROVED) {
    throw new Error(`Contract template has been approved`);
  }

  if (existingTemplate.status === CONTRACT_TEMPLATE_STATUSES.REJECTED) {
    throw new Error(`Contract template has been rejected`);
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

module.exports = {
  getAll,
  create,
  getOne,
  update,
  destroy,
  destroyMany,
  submit,
  approve,
  reject,
};
