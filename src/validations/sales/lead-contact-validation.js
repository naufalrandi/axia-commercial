const Joi = require("joi");

const createLeadContactValidation = Joi.object({
  leadId: Joi.string().uuid().required(),
  fullname: Joi.string().required(),
  designation: Joi.string().optional().allow(""),
  phoneNumber: Joi.string().optional().allow(""),
  email: Joi.string().email().optional().allow(""),
  source: Joi.string().optional().allow(""),
});

const updateLeadContactValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
  leadId: Joi.string().uuid().optional(),
  fullname: Joi.string().optional(),
  designation: Joi.string().optional().allow(""),
  phoneNumber: Joi.string().optional().allow(""),
  email: Joi.string().email().optional().allow(""),
  source: Joi.string().optional().allow(""),
});

const deleteLeadContactManyValidation = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

module.exports = {
  createLeadContactValidation,
  updateLeadContactValidation,
  deleteLeadContactManyValidation,
};
