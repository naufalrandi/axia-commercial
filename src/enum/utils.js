const HIERARCHY = Object.freeze({
  EXECUTIVE: "Executive",
  DIRECTORATE: "Directorate",
  DIVISION: "Division",
  DEPARTMENT: "Department",
  UNIT: "Unit",
});

const ACCOUNT_TYPE = Object.freeze({
  CREDIT: "Credit",
  DEBIT: "Debit",
});

const CONTRACT_TEMPLATE_STATUSES = Object.freeze({
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
});

const DOCUMENT_REVIEW_STATUS = Object.freeze({
  PENDING: "Pending",
  REVIEWED: "Reviewed",
});

const asArray = (obj) => Object.keys(obj).map((key) => obj[key]);

module.exports = {
  HIERARCHY,
  ACCOUNT_TYPE,
  CONTRACT_TEMPLATE_STATUSES,
  DOCUMENT_REVIEW_STATUS,
  asArray,
};
