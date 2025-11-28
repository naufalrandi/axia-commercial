const Joi = require("joi");

const createManyTeamRosterValidation = Joi.object({
  teamRosters: Joi.array()
    .items(
      Joi.object({
        consultantId: Joi.number().integer().positive().required(),
        status: Joi.string().required(),
        role: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
});

const updateTeamRosterValidation = Joi.object({
  consultantId: Joi.number().integer().positive().required(),
  status: Joi.string().required(),
  role: Joi.string().required(),
});

const updateManyTeamRosterValidation = Joi.object({
  teamRosters: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().optional(),
        consultantId: Joi.number().integer().positive().required(),
        status: Joi.string().required(),
        role: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
});

const deleteManyTeamRosterValidation = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

module.exports = {
  createManyTeamRosterValidation,
  updateTeamRosterValidation,
  updateManyTeamRosterValidation,
  deleteManyTeamRosterValidation,
};
