const Joi = require("joi");

const createLeadBillingContactValidation = Joi.object({
  leadId: Joi.string().uuid().required(),
  designation: Joi.string().required(),
  fullname: Joi.string().required(),
  phoneNumber: Joi.string().optional().allow(""),
  email: Joi.string().email().optional().allow(""),
});

const updateLeadBillingContactValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
  leadId: Joi.string().uuid().optional(),
  designation: Joi.string().optional(),
  fullname: Joi.string().optional(),
  phoneNumber: Joi.string().optional().allow(""),
  email: Joi.string().email().optional().allow(""),
});

const deleteLeadBillingContactManyValidation = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

module.exports = {
  createLeadBillingContactValidation,
  updateLeadBillingContactValidation,
  deleteLeadBillingContactManyValidation,
};
