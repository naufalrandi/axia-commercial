const Joi = require("joi");

const createLeadBillingContactValidation = Joi.object({
  leadId: Joi.string().uuid().required(),
  fullname: Joi.string().required(),
  phoneNumber: Joi.string().optional().allow(""),
  email: Joi.string().email().optional().allow(""),
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

const updateLeadBillingContactValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
  leadId: Joi.string().uuid().optional(),
  fullname: Joi.string().optional(),
  phoneNumber: Joi.string().optional().allow(""),
  email: Joi.string().email().optional().allow(""),
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
  }).optional(),
});

const deleteLeadBillingContactManyValidation = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

module.exports = {
  createLeadBillingContactValidation,
  updateLeadBillingContactValidation,
  deleteLeadBillingContactManyValidation,
};
