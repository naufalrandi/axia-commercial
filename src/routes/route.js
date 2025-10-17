const authMiddleware = require("../middleware/auth-middleware");
const contractTemplateController = require("../controllers/compliance/contract-template-controller");
const documentReviewController = require("../controllers/compliance/document-review-controller");
const express = require("express");
const mainRoutes = express.Router();

// Contract Templates - Compliance Module
mainRoutes.get("/contract-templates", authMiddleware, contractTemplateController.getAll);
mainRoutes.post("/contract-templates", authMiddleware, contractTemplateController.create);
mainRoutes.get("/contract-templates/:id", authMiddleware, contractTemplateController.getOne);
mainRoutes.put("/contract-templates/:id", authMiddleware, contractTemplateController.update);
mainRoutes.delete("/contract-templates/:id", authMiddleware, contractTemplateController.destroy);
mainRoutes.delete("/contract-templates", authMiddleware, contractTemplateController.destroyMany);

// Contract Template Workflow Actions
mainRoutes.put("/contract-templates/:id/submit", authMiddleware, contractTemplateController.submit);
mainRoutes.put("/contract-templates/:id/approve", authMiddleware, contractTemplateController.approve);
mainRoutes.put("/contract-templates/:id/reject", authMiddleware, contractTemplateController.reject);

// Document Reviews - Compliance Module
mainRoutes.get("/document-reviews", authMiddleware, documentReviewController.getAll);
mainRoutes.get("/document-reviews/:id", authMiddleware, documentReviewController.getOne);
mainRoutes.put("/document-reviews/:id/notes", authMiddleware, documentReviewController.setNotes);

module.exports = mainRoutes;
