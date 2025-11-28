const model = require("../models/index");
const modelAdminstrative = require("../models/administrative/index");
const modelMasterdata = require("../models/masterdata/index");
const { ResponseError } = require("../errors/response-error");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const CryptoJS = require("crypto-js");
const { transporter } = require("../applications/email");
require("dotenv");

const {
  JWT_ISSUER = "AxiaVibes",
  JWT_SECRET = "AxiaVibes54312",
  JWT_REFRESH_SECRET = "AxiaVibes54312rEFresh",
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} = process.env;
const moment = require("moment");

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
    attributes: ["id", "email", "username"],
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

async function syncDataHasMany(payload, transaction) {
  const { currentModel, where, data } = payload;
  const existingIds = await currentModel.findAll({
    where,
    attributes: ["id"],
  });

  const incomingIds = data.map((item) => item.id).filter(Boolean);
  const idsToDelete = existingIds
    .filter((item) => !incomingIds.includes(item.id))
    .map((item) => item.id);

  if (idsToDelete.length > 0) {
    await currentModel.destroy({
      where: {
        id: {
          [Op.in]: idsToDelete,
        },
      },
      transaction,
    });
  }
}

async function generateInquiryCode(service, transaction = null) {
  const inquiry = await model.Inquiry.findOne({
    order: [["runningNumber", "DESC"]],
    attributes: ["runningNumber"],
    transaction,
  });

  const runningNumber = inquiry ? inquiry.runningNumber + 1 : 1;
  const code = `0035${service.id}${runningNumber}`;

  return {
    runningNumber,
    code,
  };
}

async function generateTrainingCode(transaction = null) {
  const training = await model.Training.findOne({
    where: {
      runningNumber: {
        [Op.not]: null,
      },
    },
    attributes: ["runningNumber"],
    order: [["runningNumber", "DESC"]],
    transaction,
  });

  const runNum = training ? training.runningNumber + 1 : 1;
  return {
    runningNumber: runNum,
    code: `0209${runNum}`,
  };
}

async function generateProposalCode(data, transaction = null) {
  const { type, proposal } = data;
  const year = new Date().getFullYear();
  let runningNumber,
    version,
    code = null;

  switch (type) {
    case "CREATE":
      const existing_proposal = await model.Proposal.findOne({
        where: {
          year: year,
          runningNumber: {
            [Op.not]: null,
          },
        },
        order: [["runningNumber", "DESC"]],
        attributes: ["runningNumber"],
        transaction,
      });

      version = 1;
      runningNumber = existing_proposal
        ? existing_proposal.runningNumber + 1
        : 1;
      code = `0821-${year}-${runningNumber}-${version}`;
      return { code, runningNumber, version, year };

    case "REVISE":
      if (!proposal.runningNumber) {
        return {
          code: null,
          runningNumber: null,
          version: null,
          year: null,
        };
      }

      runningNumber = proposal.runningNumber;
      version = proposal.version + 1;
      code = `0821-${year}-${runningNumber}-${version}`;
      return { code, runningNumber, version, year };

    default:
      return {
        code: null,
        runningNumber: null,
        version: null,
        year: null,
      };
  }
}

function generateOTP(length = 6) {
  if (length <= 0) {
    throw new Error("Panjang OTP harus lebih besar dari 0");
  }

  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // Angka acak dari 0 hingga 9
  }

  return otp;
}

function parseTimeToMilliseconds(timeString) {
  const timeUnit = timeString.slice(-1); // Ambil huruf terakhir (d, h, m, s)
  const timeValue = parseInt(timeString.slice(0, -1), 10); // Ambil angka sebelum unit

  if (isNaN(timeValue)) {
    throw new Error(
      "OTP_EXPIRED harus berupa angka diikuti unit waktu (d, h, m, s)."
    );
  }

  switch (timeUnit) {
    case "d":
      return timeValue * 24 * 60 * 60 * 1000; // Hari ke milidetik
    case "h":
      return timeValue * 60 * 60 * 1000; // Jam ke milidetik
    case "m":
      return timeValue * 60 * 1000; // Menit ke milidetik
    case "s":
      return timeValue * 1000; // Detik ke milidetik
    default:
      throw new Error(
        "Unit waktu tidak valid. Gunakan 'd', 'h', 'm', atau 's'."
      );
  }
}

const getOTPVerification = async (metaData) => {
  const otp = generateOTP();
  const expiredAt = parseTimeToMilliseconds(process.env.OTP_EXPIRED || "5m");
  const verification = await modelAdminstrative.OtpVerification.create({
    otp,
    metaData,
    expired_at: new Date(Date.now() + expiredAt),
  });

  return verification.otp;
};

const verifyVerification = async (otp, metaData) => {
  const verification = await modelAdminstrative.OtpVerification.findOne({
    where: { otp, metaData },
  });

  if (!verification) {
    throw new Error("OTP is invalid");
  }

  if (verification.expired_at < new Date()) {
    throw new Error("OTP has expired");
  }

  return await modelAdminstrative.OtpVerification.destroy({
    where: { otp, metaData },
  });
};

const generateProjectCode = async (transaction) => {
  const project = await model.Project.findOne({
    where: {
      runningNumber: {
        [Op.not]: null,
      },
    },
    order: [["runningNumber", "DESC"]],
    attributes: ["runningNumber"],
    transaction,
  });

  const runningNumber = project ? project.runningNumber + 1 : 1;
  return {
    code: `0090${runningNumber}`,
    runningNumber,
  };
};

const getTrainingCourse = async (id) => {
  const trainingCourse = await modelMasterdata.TrainingCourse.findOne({
    where: { id },
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: modelMasterdata.Standard,
        as: "standards",
        attributes: { exclude: ["createdAt", "updatedAt"] },
        through: { attributes: [] },
        include: [
          {
            model: modelMasterdata.SchemeTag,
            as: "schemeTag",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
      },
    ],
  });

  return trainingCourse.get({ plain: true });
};

const generateTrainingCertificateCode = async (
  trainingId,
  transaction = null
) => {
  const training = await model.Training.findOne({
    where: { id: trainingId },
    attributes: ["code"],
    transaction,
  });

  const result = await model.TrainingCertificate.findOne({
    where: {
      runningNumber: {
        [Op.not]: null,
      },
    },
    order: [["runningNumber", "DESC"]],
    transaction,
  });

  const runningNumber = result ? result.runningNumber + 1 : 1;
  return {
    runningNumber: runningNumber,
    code: `0044/${new Date().getFullYear()}/${training.code}/${runningNumber}`,
  };
};

const createHistory = (currentHistories, label, additionalData = {}) => {
  const newHistoryEntry = {
    id: Date.now(),
    label: label,
    timestamp: new Date().toISOString(),
    details: additionalData,
  };

  let histories = [];
  if (currentHistories) {
    if (Array.isArray(currentHistories)) {
      histories = currentHistories;
    } else if (typeof currentHistories === "string") {
      try {
        const parsed = JSON.parse(currentHistories);
        if (Array.isArray(parsed)) {
          histories = parsed;
        }
      } catch (error) {
        histories = [];
      }
    }
  }
};

const createComments = (currentComments, comment, additionalData = {}) => {
  const newHistoryEntry = {
    id: Date.now(),
    comment: comment,
    timestamp: new Date().toISOString(),
    details: additionalData,
  };

  let histories = [];
  if (currentComments) {
    if (Array.isArray(currentComments)) {
      histories = currentComments;
    } else if (typeof currentComments === "string") {
      try {
        const parsed = JSON.parse(currentComments);
        if (Array.isArray(parsed)) {
          histories = parsed;
        }
      } catch (error) {
        histories = [];
      }
    }
  }

  histories.push(newHistoryEntry);
  return JSON.stringify(histories);
};

const generateWorkorderCode = async (
  type = "CREATE",
  workorderId = null,
  transaction = null
) => {
  const date = new Date().getFullYear();
  let workorder = null;
  if (type == "REVISI") {
    workorder = await model.WorkOrder.findOne({
      where: { id: workorderId },
      attributes: ["runningNumber", "version"],
      transaction,
    });

    const runningNumber = workorder.runningNumber;
    const version = workorder.version + 1;
    const code = `0019-${date}-${runningNumber}-${version}`;
    return { runningNumber, code, version };
  }

  workorder = await model.WorkOrder.findOne({
    order: [["runningNumber", "DESC"]],
    attributes: ["runningNumber"],
    transaction,
  });

  const runningNumber = workorder ? workorder.runningNumber + 1 : 1;
  const code = `0019-${date}-${runningNumber}-1`;
  return { runningNumber, code, version: 1 };
};

function getStandardsFromProject(project) {
  const standards = project?.training?.trainingCourse?.standards ?? [];

  return standards.map((std) => ({
    id: std.id,
    sortName: std.sortName,
    prefix: std.prefix,
    standardNumber: std.standardNumber,
    issueYear: std.issueYear,
  }));
}

const generateInvoiceCode = async () => {
  const date = new Date().getFullYear();
  const invoice = await modelAdminstrative.Invoice.findOne({
    order: [["runningNumber", "DESC"]],
    attributes: ["runningNumber"],
  });

  const runningNumber = invoice ? invoice.runningNumber + 1 : 1;
  const code = `0066-${date}-${runningNumber}`;
  return { runningNumber, code };
};

const getBankAccountByPurpose = async (purpose) => {
  const bankAccount = await modelAdminstrative.BankAccount.findOne({
    where: { purposeUseds: { [Op.contains]: [purpose] } },
  });

  if (!bankAccount) {
    throw new Error(`Bank account with purpose "${purpose}" not found`);
  }

  bankAccount.dataValues.bank = await modelMasterdata.Bank.findByPk(
    bankAccount.bankId,
    {
      attributes: ["id", "name", "code"],
      raw: true,
    }
  );

  return bankAccount;
};

const getPrimaryLocation = async () => {
  const location = await modelAdminstrative.Location.findOne({
    where: { primary: true },
  });

  if (!location) {
    throw new Error(`Primary location not found`);
  }

  location.dataValues.address = await enrichAddressWithMasterdata(
    location.addressId,
    modelMasterdata
  );

  return location;
};

const sentInvoiceEmail = async (invoice, billingContact) => {
  const { CURRENT_EMAIL } = process.env;

  if (!billingContact || !billingContact.email) {
    throw new ResponseError(
      400,
      "Billing contact email is required to send invoice"
    );
  }

  const dueDate = moment(invoice.paymentTerm.dueDate)
    .add(invoice.paymentTerm.days, "day")
    .format("YYYY-MM-DD");

  await modelAdminstrative.Invoice.update(
    {
      dueDate: dueDate,
    },
    {
      where: { id: invoice.id },
    }
  );

  const { legalEntityType, name } = invoice?.client ?? {};
  const clientName = `${legalEntityType?.prefix ?? ""}. ${name ?? ""} ${
    legalEntityType?.suffix ?? ""
  }`.trim();

  const mailOptions = {
    from: CURRENT_EMAIL ?? "sample@axia.com",
    to: billingContact.email,
    subject: `Confidential: Invoice ${invoice.code} for ${clientName}`,
    template: "invoice",
    context: {
      billingName: billingContact?.fullname || billingContact?.email,
      invoiceNumber: invoice.code,
      issueDate: moment(invoice.issueDate).format("DD MMMM YYYY"),
      dueDate: moment(dueDate).format("DD MMMM YYYY"),
      // amount: invoice?.investmentFees?.totalFeesPaid,
      bankName: invoice?.bankAccount?.bank?.name,
      accountHolder: invoice?.bankAccount?.accountHolder,
      accountNumber: invoice?.bankAccount?.accountNumber,
      bankAddress: invoice?.bankAccount?.bankAddress,
    },
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (emailError) {
    throw new ResponseError(
      500,
      `Failed to send invoice email: ${emailError.message}`
    );
  }
};

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
  syncDataHasMany,
  generateInquiryCode,
  generateTrainingCode,
  generateProposalCode,
  getOTPVerification,
  verifyVerification,
  generateProjectCode,
  getTrainingCourse,
  generateTrainingCertificateCode,
  createHistory,
  createComments,
  generateWorkorderCode,
  getStandardsFromProject,
  generateInvoiceCode,
  getBankAccountByPurpose,
  getPrimaryLocation,
  sentInvoiceEmail,
};
