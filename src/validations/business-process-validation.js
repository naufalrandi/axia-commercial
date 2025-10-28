const Joi = require("joi");

const createBusinessProcessValidation = Joi.object({
  leadId: Joi.string().uuid().required(),
  leadLocations: Joi.array().items(
    Joi.object({
      id: Joi.number().positive().required(),
    })
  ).optional(),
  name: Joi.string().max(255).required(),
  processFunctions: Joi.array().items(
    Joi.object({
      id: Joi.number().positive().required(),
    })
  ).optional(),
});

const updateBusinessProcessValidation = Joi.object({
  id: Joi.number().positive().required(),
  leadId: Joi.string().uuid().optional(),
  leadLocations: Joi.array().items(
    Joi.object({
      id: Joi.number().positive().required(),
    })
  ).optional(),
  name: Joi.string().max(255).optional(),
  processFunctions: Joi.array().items(
    Joi.object({
      id: Joi.number().positive().required(),
    })
  ).optional(),
});

const deleteBusinessProcessManyValidation = Joi.object({
  ids: Joi.array().items(Joi.number().positive()).min(1).required(),
});

module.exports = {
  createBusinessProcessValidation,
  updateBusinessProcessValidation,
  deleteBusinessProcessManyValidation,
};