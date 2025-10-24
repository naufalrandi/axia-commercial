const Joi = require("joi");

const createLeadValidation = Joi.object({
  legalEntityTypeId: Joi.number().required(),
  name: Joi.string().required(),
  taxNumber: Joi.string().optional().allow(""),
  website: Joi.string().uri().optional().allow(""),
  iafCodes: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
      })
    )
    .optional()
    .default([]),
});

const updateLeadValidation = Joi.object({
  id: Joi.string().required(),
  legalEntityTypeId: Joi.number().optional(),
  name: Joi.string().optional(),
  taxNumber: Joi.string().optional().allow(""),
  website: Joi.string().uri().optional().allow(""),
  iafCodes: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
      })
    )
    .optional(),
});

const deleteLeadManyValidation = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

module.exports = {
  createLeadValidation,
  updateLeadValidation,
  deleteLeadManyValidation,
};
