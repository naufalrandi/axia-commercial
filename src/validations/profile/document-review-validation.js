const Joi = require("joi");

const setNotesValidation = Joi.object({
  notes: Joi.string().allow("").required(),
});

module.exports = {
  setNotesValidation,
};
