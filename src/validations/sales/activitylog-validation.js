const Joi = require("joi");

const createActivityLogValidation = Joi.object({
  projectId: Joi.string().uuid().required(),
  users: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
      })
    )
    .optional(),
  consultancyPrograms: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
      })
    )
    .optional(),
  startDate: Joi.date().optional().allow(null),
  endDate: Joi.date().optional().allow(null),
  remarks: Joi.string().optional().allow(""),
});

const updateActivityLogValidation = Joi.object({
  id: Joi.string().required(),
  projectId: Joi.string().uuid().optional(),
  users: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
      })
    )
    .optional(),
  consultancyPrograms: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
      })
    )
    .optional(),
  startDate: Joi.date().optional().allow(null),
  endDate: Joi.date().optional().allow(null),
  remarks: Joi.string().optional().allow(""),
});

const deleteActivityLogManyValidation = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

module.exports = {
  createActivityLogValidation,
  updateActivityLogValidation,
  deleteActivityLogManyValidation,
};
