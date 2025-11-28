const Joi = require("joi");

const updateLeadInvoiceValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
  billTo: Joi.object().optional(),
  bankAccount: Joi.object().optional(),
  notes: Joi.string().optional().allow("", null),
});

module.exports = {
  updateLeadInvoiceValidation,
};
