const model = require("../models/index");
const modelAdminstrative = require("../models/administrative/index");
const modelMasterdata = require("../models/masterdata/index");
const { ResponseError } = require("../errors/response-error");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const CryptoJS = require("crypto-js");
require("dotenv");

const {
  JWT_ISSUER = "AxiaVibes",
  JWT_SECRET = "AxiaVibes54312",
  JWT_REFRESH_SECRET = "AxiaVibes54312rEFresh",
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} = process.env;

function generateToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: JWT_ISSUER,
  });
}

async function verifyToken(token) {
  const invalidToken = await modelAdminstrative.InvalidToken.findOne({
    where: { token },
  });

  if (invalidToken)
    return next(new ResponseError(401, "Token has been invalidated"));

  return jwt.verify(token, JWT_SECRET, {
    issuer: JWT_ISSUER,
  });
}

function verifyRefreshToken(token) {
  if (!token) return next(new ResponseError(401, "Unauthenticated"));
  return jwt.verify(token, JWT_REFRESH_SECRET, { issuer: JWT_ISSUER });
}

function pagination(data, page, limit) {
  const { count: totalItems, rows: datas } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems,
    data: datas,
    totalPages,
    currentPage,
  };
}

function paginationData(query) {
  let { page, size, sortBy, orderby, search } = query;
  sortBy = sortBy ?? "createdAt";
  orderby = orderby ?? "desc";
  search = search ?? "";
  const limit = size ? +size : 10;
  const offset = page ? (page - 1) * limit : 0;

  return {
    ...query,
    limit,
    offset,
    orderby,
    sortBy,
    search,
  };
}

function generateSlug(val) {
  return val
    .toLowerCase()
    .trim()
    .replace(/--+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-");
}

function searchData(fields, search) {
  if (!Array.isArray(fields)) fields = [];
  const result = {
    [Op.or]: fields.map((item) => ({
      [item]: {
        [Op.iLike]: `%${search}%`,
      },
    })),
  };

  return result;
}

async function getIdModel(modelName) {
  const result = await model[modelName].findOne({
    order: [["id", "DESC"]],
  });

  return result?.id ? parseInt(result.id) + 1 : 1;
}

function encryptData(data) {
  const stringData = typeof data === "string" ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(stringData, process.env.JWT_SECRET).toString();
}

function decryptData(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, process.env.JWT_SECRET);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString); // otomatis parse JSON
  } catch (error) {
    console.error("Failed to decrypt data:", error.message);
    return null;
  }
}

function checkStatus(statuses, status, key = null) {
  if (!statuses.includes(status))
    throw new Error(
      `${key || "Status"} must be one of: ${statuses.join(", ")}`
    );
}

// Generic function to get single data by ID
async function getDataById(modelName, id, errorMessage = "Data not found") {
  const result = await model[modelName].findOne({
    where: { id },
  });

  if (!result) throw new ResponseError(404, errorMessage);
  return result.dataValues;
}

// Generic function to check if data exists
async function checkDataExists(modelName, where) {
  return await model[modelName].findOne({
    where,
  });
}

// Generic function to check uniqueness
async function checkUniqueness(
  modelName,
  field,
  value,
  excludeId = null,
  errorMessage = null
) {
  const whereClause = { [field]: value };

  if (excludeId) {
    whereClause.id = { [Op.ne]: excludeId };
  }

  const exists = await checkDataExists(modelName, whereClause);

  if (exists) {
    const message = errorMessage || `${field} already exists`;
    throw new ResponseError(400, message);
  }
}

// Function to add history entry
function addHistoryEntry(
  existingHistories = [],
  action,
  userId,
  userName = "Superadmin",
  notes = "",
  createdAt = new Date()
) {
  const histories = Array.isArray(existingHistories)
    ? [...existingHistories]
    : [];

  histories.push({
    action,
    userId,
    userName,
    createdAt,
    notes,
  });

  return histories;
}

// Function to validate status transition
function validateStatusTransition(
  currentStatus,
  newStatus,
  allowedTransitions
) {
  const allowed = allowedTransitions[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    throw new ResponseError(
      400,
      `Cannot transition from ${currentStatus} to ${newStatus}`
    );
  }
}

// Function to update model with history tracking
async function updateWithHistory(modelName, id, updateData, historyEntry) {
  const existingData = await getDataById(modelName, id);

  const histories = addHistoryEntry(
    existingData.histories,
    historyEntry.action,
    historyEntry.userId,
    historyEntry.userName,
    historyEntry.notes
  );

  const finalData = {
    ...updateData,
    histories,
  };

  const [affectedRows] = await model[modelName].update(finalData, {
    where: { id },
  });

  if (affectedRows === 0) {
    throw new ResponseError(404, "Data not found or no changes made");
  }

  return await getDataById(modelName, id);
}

function createContractHistoryEntry(
  action,
  userId,
  userName = "Superadmin",
  notes = ""
) {
  return {
    action,
    userId,
    userName,
    createdAt: new Date(),
    notes,
  };
}

async function generateContractTemplateCode(contractVariantId) {
  if (!contractVariantId) {
    throw new Error("contractVariantId is required to generate code");
  }

  const contractVariant = await modelMasterdata.ContractVariant.findOne({
    where: { id: contractVariantId },
    include: [
      {
        model: modelMasterdata.ContractSubcategory,
        as: "contractSubcategory",
        include: [
          {
            model: modelMasterdata.ContractCategory,
            as: "contractCategory",
          },
        ],
      },
    ],
  });

  if (!contractVariant) {
    throw new Error("Invalid contractVariantId");
  }

  const variantCode = contractVariant?.code ?? "";
  const subCategoryCode = contractVariant?.contractSubcategory?.code ?? "";
  const categoryCode =
    contractVariant?.contractSubcategory?.contractCategory?.code ?? "";

  return `${categoryCode}/${subCategoryCode}/${variantCode}`;
}

async function getUser(userId) {
  if (!userId) return null;
  const user = await modelAdminstrative.User.findByPk(userId, {
    attributes: ["id", "email"],
    include: [
      {
        model: modelAdminstrative.UserDetail,
        as: "userDetail",
        attributes: ["id", "fullname"],
      },
    ],
  });

  return user;
}

// DocumentReview specific constants
const DOCUMENT_REVIEW_STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  REJECTED: "rejected",
};

// Removed REVIEW_PRIORITIES as we simplified the model

const REVIEWABLE_TYPES = {
  CONTRACT_TEMPLATE: "ContractTemplate",
  DOCUMENT: "Document",
  AGREEMENT: "Agreement",
  CONTRACT: "Contract",
};

// DocumentReview status transition rules
const DOCUMENT_REVIEW_STATUS_TRANSITIONS = {
  [DOCUMENT_REVIEW_STATUSES.PENDING]: [DOCUMENT_REVIEW_STATUSES.IN_PROGRESS],
  [DOCUMENT_REVIEW_STATUSES.IN_PROGRESS]: [
    DOCUMENT_REVIEW_STATUSES.COMPLETED,
    DOCUMENT_REVIEW_STATUSES.REJECTED,
  ],
  [DOCUMENT_REVIEW_STATUSES.COMPLETED]: [], // Final state
  [DOCUMENT_REVIEW_STATUSES.REJECTED]: [DOCUMENT_REVIEW_STATUSES.PENDING],
};

// Function to validate document review status transition
function validateDocumentReviewStatus(currentStatus, newStatus) {
  validateStatusTransition(
    currentStatus,
    newStatus,
    DOCUMENT_REVIEW_STATUS_TRANSITIONS
  );
}

// Function to create bulk reviews for a reviewable item
async function createBulkReviews(
  reviewableType,
  reviewableId,
  reviewers,
  createdById = 1
) {
  const reviews = [];

  for (let i = 0; i < reviewers.length; i++) {
    const reviewer = reviewers[i];
    const reviewData = {
      userId: reviewer.userId,
      reviewableType,
      reviewableId,
      status: DOCUMENT_REVIEW_STATUSES.PENDING,
      notes: reviewer.notes || "",
    };

    const review = await model.DocumentReview.create(reviewData);
    reviews.push(review);
  }

  return reviews;
}

// Function to check if all reviews are completed for a reviewable item
async function areAllReviewsCompleted(reviewableType, reviewableId) {
  const pendingCount = await model.DocumentReview.count({
    where: {
      reviewableType,
      reviewableId,
      status: {
        [Op.in]: [
          DOCUMENT_REVIEW_STATUSES.PENDING,
          DOCUMENT_REVIEW_STATUSES.IN_PROGRESS,
        ],
      },
    },
  });

  return pendingCount === 0;
}

// Function to get review statistics for a reviewable item
async function getReviewStatistics(reviewableType, reviewableId) {
  const allReviews = await model.DocumentReview.findAll({
    where: {
      reviewableType,
      reviewableId,
    },
  });

  const stats = {
    total: allReviews.length,
    completed: 0,
    pending: 0,
    inProgress: 0,
    rejected: 0,
  };

  allReviews.forEach((review) => {
    stats[review.status.toLowerCase().replace("_", "")]++;
  });

  stats.completionRate =
    stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(2) : 0;

  return stats;
}

// Function to assign review to user
async function assignReviewToUser(
  reviewId,
  userId,
  assignedById = 1,
  notes = ""
) {
  const review = await getDataById(
    "DocumentReview",
    reviewId,
    "Review not found"
  );

  const updateData = {
    userId: userId,
    status: DOCUMENT_REVIEW_STATUSES.PENDING,
    notes: notes || review.notes,
  };

  const [affectedRows] = await model.DocumentReview.update(updateData, {
    where: { id: reviewId },
  });

  if (affectedRows === 0) {
    throw new ResponseError(404, "Review not found or no changes made");
  }

  return await getDataById("DocumentReview", reviewId, "Review not found");
}

// Function to get pending reviews by user
async function getPendingReviewsByUser(userId = null) {
  const whereClause = {
    status: {
      [Op.in]: [
        DOCUMENT_REVIEW_STATUSES.PENDING,
        DOCUMENT_REVIEW_STATUSES.IN_PROGRESS,
      ],
    },
  };

  if (userId) {
    whereClause.userId = userId;
  }

  return await model.DocumentReview.findAll({
    where: whereClause,
    order: [["createdAt", "ASC"]],
  });
}

async function getContractVariant(id) {
  if (!id) return null;
  return await modelMasterdata.ContractVariant.findByPk(id, {
    attributes: { exclude: ["description", "createdAt", "updatedAt"] },
    include: [
      {
        model: modelMasterdata.ContractSubcategory,
        attributes: { exclude: ["description", "createdAt", "updatedAt"] },
        as: "contractSubcategory",
        include: [
          {
            model: modelMasterdata.ContractCategory,
            attributes: { exclude: ["description", "createdAt", "updatedAt"] },
            as: "contractCategory",
          },
        ],
      },
    ],
  });
}

async function generateLeadCode(transaction = null) {
  const course = await model.Lead.findOne({
    where: {
      runningNumber: {
        [Op.not]: null,
      },
    },
    attributes: ["runningNumber"],
    order: [["runningNumber", "DESC"]],
    transaction,
  });

  const runNum = course ? course.runningNumber + 1 : 1;
  return {
    runningNumber: runNum,
    code: `0080${runNum}`,
  };
}

// Helper function to check if legal entity type exists in masterdata
async function checkLegalEntityType(legalEntityTypeId) {
  try {
    const legalEntityType = await modelMasterdata.LegalEntityType.findByPk(
      legalEntityTypeId
    );
    return !!legalEntityType;
  } catch (error) {
    console.error("Error checking legal entity type:", error);
    return false;
  }
}

// Helper function to check if IAF codes exist in masterdata
async function checkIafCodes(iafCodes) {
  try {
    if (!iafCodes || !Array.isArray(iafCodes) || iafCodes.length === 0) {
      return true; // IAF codes are optional
    }

    const iafCodeIds = iafCodes.map((iaf) => iaf.id);
    const existingIafCodes = await modelMasterdata.IafCode.findAll({
      where: {
        id: {
          [Op.in]: iafCodeIds,
        },
      },
    });

    // Check if all provided IAF codes exist
    return existingIafCodes.length === iafCodeIds.length;
  } catch (error) {
    console.error("Error checking IAF codes:", error);
    return false;
  }
}

async function enrichAddressWithMasterdata(addressId, modelMasterdata) {
  if (!addressId) return null;

  const address = await modelAdminstrative.Address.findByPk(addressId);
  if (!address) return null;

  const promises = [];
  if (address.countryId) {
    promises.push(
      modelMasterdata.Country.findByPk(address.countryId, {
        attributes: ["id", "name"],
      }).then((country) => ({ field: "country", data: country }))
    );
  }

  if (address.provinceId) {
    promises.push(
      modelMasterdata.Province.findByPk(address.provinceId, {
        attributes: ["id", "name"],
      }).then((province) => ({ field: "province", data: province }))
    );
  }

  if (address.cityId) {
    promises.push(
      modelMasterdata.City.findByPk(address.cityId, {
        attributes: ["id", "name"],
      }).then((city) => ({ field: "city", data: city }))
    );
  }

  if (address.districtId) {
    promises.push(
      modelMasterdata.District.findByPk(address.districtId, {
        attributes: ["id", "name"],
      }).then((district) => ({ field: "district", data: district }))
    );
  }

  if (address.villageId) {
    promises.push(
      modelMasterdata.Village.findByPk(address.villageId, {
        attributes: ["id", "name"],
      }).then((village) => ({ field: "village", data: village }))
    );
  }

  if (promises.length > 0) {
    const results = await Promise.all(promises);
    results.forEach((result) => {
      if (result.data) {
        address.dataValues[result.field] = result.data;
      }
    });
  }

  return address;
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  pagination,
  paginationData,
  generateSlug,
  searchData,
  getIdModel,
  encryptData,
  decryptData,
  checkStatus,
  getDataById,
  checkDataExists,
  checkUniqueness,
  addHistoryEntry,
  validateStatusTransition,
  updateWithHistory,
  createContractHistoryEntry,
  generateContractTemplateCode,
  getUser,
  // DocumentReview constants and functions
  DOCUMENT_REVIEW_STATUSES,
  REVIEWABLE_TYPES,
  DOCUMENT_REVIEW_STATUS_TRANSITIONS,
  validateDocumentReviewStatus,
  createBulkReviews,
  areAllReviewsCompleted,
  getReviewStatistics,
  assignReviewToUser,
  getPendingReviewsByUser,
  getContractVariant,
  generateLeadCode,
  checkLegalEntityType,
  checkIafCodes,
  enrichAddressWithMasterdata,
};
