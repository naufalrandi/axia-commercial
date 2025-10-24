const Joi = require("joi");

const createLeadLocationValidation = Joi.object({
  leadId: Joi.string().uuid().required(),
  address: Joi.object({
    name: Joi.string().required(),
    addressLine: Joi.string().required(),
    villageId: Joi.number().integer().positive().required(),
    districtId: Joi.number().integer().positive().required(),
    cityId: Joi.number().integer().positive().required(),
    provinceId: Joi.number().integer().positive().required(),
    countryId: Joi.number().integer().positive().required(),
    postalCode: Joi.string().required(),
  }).required(),
});

const updateLeadLocationValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
  leadId: Joi.string().uuid().optional(),
  address: Joi.object({
    id: Joi.number().integer().positive().required(),
    name: Joi.string().required(),
    addressLine: Joi.string().required(),
    villageId: Joi.number().integer().positive().required(),
    districtId: Joi.number().integer().positive().required(),
    cityId: Joi.number().integer().positive().required(),
    provinceId: Joi.number().integer().positive().required(),
    countryId: Joi.number().integer().positive().required(),
    postalCode: Joi.string().required(),
  }).required(),
});

const deleteLeadLocationManyValidation = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

module.exports = {
  createLeadLocationValidation,
  updateLeadLocationValidation,
  deleteLeadLocationManyValidation,
};
