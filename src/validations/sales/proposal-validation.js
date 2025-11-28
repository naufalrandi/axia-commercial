const Joi = require("joi");
const { asArray, PROPOSAL_STATUS } = require("../../enum/utils");

const setBillingContactValidation = Joi.object({
  billingContactId: Joi.number().integer().positive().required(),
});

const updateInvestmentFeesValidation = Joi.object({
  details: Joi.required(),
  subTotal: Joi.number().required(),
  discount: Joi.number().required(),
  discountAmount: Joi.number().required(),
  vat: Joi.number().required(),
  vatAmount: Joi.number().required(),
  tax: Joi.number().required(),
  taxAmount: Joi.number().required(),
  grandTotal: Joi.number().required(),
});

const deleteInquiryManyValidation = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

const sentEmailValidation = Joi.object({
  leadContactId: Joi.number().integer().positive().required(),
});

const updateStatusValidation = Joi.object({
  status: Joi.string()
    .valid(...asArray(PROPOSAL_STATUS))
    .required(),
  remarks: Joi.string().max(1000).optional().allow(null, ""),
  metaData: Joi.optional().allow(null),
});

module.exports = {
  setBillingContactValidation,
  updateInvestmentFeesValidation,
  deleteInquiryManyValidation,
  sentEmailValidation,
  updateStatusValidation,
};
