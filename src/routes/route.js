const authMiddleware = require("../middleware/auth-middleware");
const leadController = require("../controllers/sales/lead-controller");
const leadLocationController = require("../controllers/sales/lead-location-controller");
const leadContactController = require("../controllers/sales/lead-contact-controller");
const leadBillingContactController = require("../controllers/sales/lead-billing-contact-controller");
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

module.exports = mainRoutes;
