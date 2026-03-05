const authMiddleware = require("../middleware/auth-middleware");
const leadController = require("../controllers/sales/lead-controller");
const leadLocationController = require("../controllers/sales/lead-location-controller");
const leadContactController = require("../controllers/sales/lead-contact-controller");
const leadBillingContactController = require("../controllers/sales/lead-billing-contact-controller");
const businessProcessController = require("../controllers/sales/business-process-controller");
const inquiryController = require("../controllers/sales/inquiry-controller");
const proposalController = require("../controllers/sales/proposal-controller");
const projectController = require("../controllers/sales/project-controller");
const teamRosterController = require("../controllers/sales/team-roster-controller");
const activityLogController = require("../controllers/sales/activitylog-controller");
const workorderController = require("../controllers/sales/workorder-controller");
const leadInvoiceController = require("../controllers/sales/leadinvoice-controller");

// Bypass
const projectBypassController = require("../controllers/sales/project-bypass-controller");

// Routes
const express = require("express");
const mainRoutes = express.Router();

// Leads - Sales Module
mainRoutes.get("/leads", authMiddleware, leadController.getAll);
mainRoutes.post("/leads", authMiddleware, leadController.create);
mainRoutes.get("/leads/:id", authMiddleware, leadController.getOne);
mainRoutes.put("/leads/:id", authMiddleware, leadController.update);
mainRoutes.delete("/leads/:id", authMiddleware, leadController.destroy);
mainRoutes.delete("/leads", authMiddleware, leadController.destroyMany);

// Lead Locations - Sales Module
mainRoutes.get("/lead-locations", authMiddleware, leadLocationController.getAll);
mainRoutes.post("/lead-locations", authMiddleware, leadLocationController.create);
mainRoutes.get("/lead-locations/:id", authMiddleware, leadLocationController.getOne);
mainRoutes.put("/lead-locations/:id", authMiddleware, leadLocationController.update);
mainRoutes.delete("/lead-locations/:id", authMiddleware, leadLocationController.destroy);
mainRoutes.delete("/lead-locations", authMiddleware, leadLocationController.destroyMany);
mainRoutes.put("/lead-locations/:id/sync-business-processes", authMiddleware, leadLocationController.syncBusinessProcess);

// Lead Contacts - Sales Module
mainRoutes.get("/lead-contacts", authMiddleware, leadContactController.getAll);
mainRoutes.post("/lead-contacts", authMiddleware, leadContactController.create);
mainRoutes.get("/lead-contacts/:id", authMiddleware, leadContactController.getOne);
mainRoutes.put("/lead-contacts/:id", authMiddleware, leadContactController.update);
mainRoutes.delete("/lead-contacts/:id", authMiddleware, leadContactController.destroy);
mainRoutes.delete("/lead-contacts", authMiddleware, leadContactController.destroyMany);

// Lead Billing Contacts - Sales Module
mainRoutes.get("/lead-billing-contacts", authMiddleware, leadBillingContactController.getAll);
mainRoutes.post("/lead-billing-contacts", authMiddleware, leadBillingContactController.create);
mainRoutes.get("/lead-billing-contacts/:id", authMiddleware, leadBillingContactController.getOne);
mainRoutes.put("/lead-billing-contacts/:id", authMiddleware, leadBillingContactController.update);
mainRoutes.delete("/lead-billing-contacts/:id", authMiddleware, leadBillingContactController.destroy);
mainRoutes.delete("/lead-billing-contacts", authMiddleware, leadBillingContactController.destroyMany);

// Business Process
mainRoutes.get("/business-processes", authMiddleware, businessProcessController.getAll);
mainRoutes.post("/business-processes", authMiddleware, businessProcessController.create);
mainRoutes.get("/business-processes/:id", authMiddleware, businessProcessController.getOne);
mainRoutes.put("/business-processes/:id", authMiddleware, businessProcessController.update);
mainRoutes.delete("/business-processes/:id", authMiddleware, businessProcessController.destroy);
mainRoutes.delete("/business-processes", authMiddleware, businessProcessController.destroyMany);

// Inquiry
mainRoutes.get("/inquiries", authMiddleware, inquiryController.getAll);
mainRoutes.post("/inquiries", authMiddleware, inquiryController.create);
mainRoutes.get("/inquiries/:id", authMiddleware, inquiryController.getOne);
mainRoutes.put("/inquiries/:id/consultancy", authMiddleware, inquiryController.updateConsultancy);
mainRoutes.put("/inquiries/:id/training", authMiddleware, inquiryController.updateTraining);
mainRoutes.delete("/inquiries/:id", authMiddleware, inquiryController.destroy);
mainRoutes.delete("/inquiries", authMiddleware, inquiryController.destroyMany);
mainRoutes.post("/inquiries/:id/generate-proposal", authMiddleware, inquiryController.generateProposal);

// Proposal
mainRoutes.get("/proposals", authMiddleware, proposalController.getAll);
mainRoutes.get("/proposals/:id", authMiddleware, proposalController.getOne);
mainRoutes.put("/proposals/:id/billing-contact", authMiddleware, proposalController.setBillingContact);
mainRoutes.put("/proposals/:id/investment-fees", authMiddleware, proposalController.updateInvestmentFees);
mainRoutes.post("/proposals/:id/sent-email", authMiddleware, proposalController.sendEmail);
mainRoutes.post("/proposals/:id/resent-email", authMiddleware, proposalController.resendEmail);
mainRoutes.delete("/proposals/:id", authMiddleware, proposalController.destroy);
mainRoutes.delete("/proposals", authMiddleware, proposalController.destroyMany);

mainRoutes.get("/public/proposals/:id", proposalController.getOnePublic);
mainRoutes.get("/public/proposals/:id/get-otp", proposalController.getOtp);
mainRoutes.post("/public/proposals/:id/verify-otp", proposalController.verifyOtp);
mainRoutes.put("/public/proposals/:id/update-status", proposalController.updateStatus);

// Project
mainRoutes.get("/projects", authMiddleware, projectController.getAll);
mainRoutes.get("/projects/:id", authMiddleware, projectController.getOne);
mainRoutes.delete("/projects/:id", authMiddleware, projectController.destroy);
mainRoutes.delete("/projects", authMiddleware, projectController.destroyMany);
mainRoutes.post("/projects/:id/training-certificates", authMiddleware, projectController.createTrainingCertificates);
mainRoutes.put("/projects/:id/training-certificates/:trainingCertificateId", authMiddleware, projectController.updateTrainingCertificate);
mainRoutes.delete("/projects/:id/training-certificates/:trainingCertificateId", authMiddleware, projectController.deleteTrainingCertificate);
mainRoutes.delete("/projects/:id/training-certificates", authMiddleware, projectController.deleteManyTrainingCertificate);
mainRoutes.put("/projects/:id/training-classes", authMiddleware, projectController.updateTrainingClasses);

// Project Bypass
mainRoutes.get("/bypass/projects", authMiddleware, projectBypassController.getAll);
mainRoutes.post("/bypass/projects", authMiddleware, projectBypassController.create);
mainRoutes.post("/bypass/projects/import", authMiddleware, projectBypassController.importProject);
mainRoutes.get("/bypass/projects/:id", authMiddleware, projectBypassController.getOne);
mainRoutes.put("/bypass/projects/:id", authMiddleware, projectBypassController.update);
mainRoutes.delete("/bypass/projects/:id", authMiddleware, projectBypassController.destroy);
mainRoutes.post("/bypass/projects/:id/training/certificates", authMiddleware, projectBypassController.createTrainingCertificates);
mainRoutes.put("/bypass/projects/:id/training/certificates/:trainingCertificateId", authMiddleware, projectBypassController.updateTrainingCertificate);
mainRoutes.delete("/bypass/projects/:id/training/certificates/:trainingCertificateId", authMiddleware, projectBypassController.deleteTrainingCertificate);
mainRoutes.get("/bypass/projects/training/certificates/:hashCode/public", projectBypassController.getOneTrainingCertificatePublic);
mainRoutes.post("/bypass/projects/training/certificates/verify/public", projectBypassController.verifyTrainingCertificatePublic);

// Team Roster
mainRoutes.get("/projects/:id/team-rosters", authMiddleware, teamRosterController.getAll);
mainRoutes.post("/projects/:id/team-rosters", authMiddleware, teamRosterController.createMany);
mainRoutes.put("/projects/:id/team-rosters", authMiddleware, teamRosterController.updateMany);
mainRoutes.put("/projects/:id/team-rosters/:teamRosterId", authMiddleware, teamRosterController.updateOne);
mainRoutes.get("/projects/:id/team-rosters/:teamRosterId", authMiddleware, teamRosterController.getOne);
mainRoutes.delete("/projects/:id/team-rosters/:teamRosterId", authMiddleware, teamRosterController.destroy);
mainRoutes.delete("/projects/:id/team-rosters", authMiddleware, teamRosterController.destroyMany);

// Deliverables
mainRoutes.post("/projects/:id/deliverables/:deliverableId/set-consultants", authMiddleware, projectController.setConsultantsPrograms);

// Milestones
mainRoutes.post("/projects/:id/milestones/:milestoneId/set-date", authMiddleware, projectController.setDateMilestone);
mainRoutes.post("/projects/:id/milestones/:milestoneId/update-status", authMiddleware, projectController.updateStatusMilestone);
mainRoutes.post("/projects/:id/milestones/:milestoneId/comments", authMiddleware, projectController.comments);
mainRoutes.post("/projects/:id/milestones/:milestoneId/upload-files", authMiddleware, projectController.uploadFiles);

// Activity Logs
mainRoutes.get("/projects/:id/activity-logs", authMiddleware, activityLogController.getAll);
mainRoutes.post("/projects/:id/activity-logs", authMiddleware, activityLogController.create);
mainRoutes.get("/projects/:id/activity-logs/:activityLogId", authMiddleware, activityLogController.getOne);
mainRoutes.put("/projects/:id/activity-logs/:activityLogId", authMiddleware, activityLogController.update);
mainRoutes.delete("/projects/:id/activity-logs/:activityLogId", authMiddleware, activityLogController.destroy);
mainRoutes.delete("/projects/:id/activity-logs", authMiddleware, activityLogController.destroyMany);

// Workorders
mainRoutes.get("/workorders", authMiddleware, workorderController.getAll);
mainRoutes.get("/workorders/:id", authMiddleware, workorderController.getOne);
mainRoutes.post("/workorders/generate", authMiddleware, workorderController.generateWorkorder);
mainRoutes.post("/workorders/generate-all", authMiddleware, workorderController.generateWorkorderMany);
mainRoutes.post("/workorders/:id/set-compensation", authMiddleware, workorderController.setCompensation);
mainRoutes.post("/workorders/:id/sent", authMiddleware, workorderController.sendWorkOrder);
mainRoutes.post("/workorders/:id/update-status", authMiddleware, workorderController.updateStatus);

// Lead Invoices - Sales Module
mainRoutes.get("/lead-invoices", authMiddleware, leadInvoiceController.getAll);
mainRoutes.get("/lead-invoices/:id", authMiddleware, leadInvoiceController.getOne);
mainRoutes.put("/lead-invoices/:id", authMiddleware, leadInvoiceController.update);

module.exports = mainRoutes;
