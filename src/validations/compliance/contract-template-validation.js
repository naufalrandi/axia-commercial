const Joi = require("joi");

const createValidation = Joi.object({
  contractVariantId: Joi.number().integer().positive().required(),
  approverId: Joi.number().integer().positive().required(),
  createdById: Joi.number().integer().positive().required(),
  reviewers: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
      })
    )
    .optional()
    .allow(null),
  standardClauses: Joi.required(),
});

const updateValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
  contractVariantId: Joi.number().integer().positive().required(),
  approverId: Joi.number().integer().positive().required(),
  createdById: Joi.number().integer().positive().required(),
  reviewers: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
      })
    )
    .optional()
    .allow(null),
  standardClauses: Joi.required(),
});

const deleteManyValidation = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

const approveValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
  approverId: Joi.number().integer().positive().required(),
  reason: Joi.string().allow("").optional(),
});

const rejectValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
  approverId: Joi.number().integer().positive().required(),
  reason: Joi.string().required(),
});

module.exports = {
  createValidation,
  updateValidation,
  deleteManyValidation,
  approveValidation,
  rejectValidation,
};
