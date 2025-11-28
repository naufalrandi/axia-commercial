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

const SERVICES = Object.freeze({
  CONSULTANCY: "Consultancy",
  TRAINING: "Training",
});

const PROPOSAL_STATUS = Object.freeze({
  DRAFT: "Draft",
  SENT: "Sent",
  NEGOTIATED: "Negotiated",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
});

const PROJECT_STATUS = Object.freeze({
  PENDING: "Pending",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
});

const MILESTONE_STATUS = Object.freeze({
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
});

const WORKORDER_STATUS = Object.freeze({
  DRAFT: "Draft",
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
});

const PAYMENT_CONDITIONS = Object.freeze({
  AFTER_ACCEPTED_PROPOSAL: "After Accepted Proposal",
  BEFORE_PROGRAM: "Before Program",
  AFTER_PROGRAM: "After Program",
  BEFORE_CLASS: "Before Class",
  AFTER_CLASS: "After Class",
  AFTER_LAST_SCHEDULED: "After Last Scheduled",
  AFTER_LAST_SESSION: "After Last Session",
});

const asArray = (obj) => Object.keys(obj).map((key) => obj[key]);

module.exports = {
  HIERARCHY,
  ACCOUNT_TYPE,
  CONTRACT_TEMPLATE_STATUSES,
  DOCUMENT_REVIEW_STATUS,
  SERVICES,
  PROPOSAL_STATUS,
  PROJECT_STATUS,
  MILESTONE_STATUS,
  WORKORDER_STATUS,
  PAYMENT_CONDITIONS,
  asArray,
};
