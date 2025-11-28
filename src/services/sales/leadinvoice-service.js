const model = require("../../models/index");
const modelAdministrative = require("../../models/administrative/index");
const {
  paginationData,
  pagination,
  searchData,
} = require("../../helpers/func");
const { Op } = require("sequelize");
const { ResponseError } = require("../../errors/response-error");
const validate = require("../../validations/validation");
const { updateLeadInvoiceValidation } = require("../../validations/sales/leadinvoice-validation");

const getLeadInvoice = async (id) => {
  const leadInvoice = await model.LeadInvoice.findOne({
    where: { id },
  });

  if (!leadInvoice) {
    throw new ResponseError(404, "Lead Invoice not found");
  }

  const invoice = await modelAdministrative.Invoice.findOne({
    where: { id: leadInvoice.invoiceId },
  });

  if (invoice) {
    const result = leadInvoice.get({ plain: true });
    result.invoice = invoice.get({ plain: true });
    return result;
  }

  return leadInvoice.get({ plain: true });
};

const getAll = async (query) => {
  const { page, limit, offset, orderby, sortBy, search, leadId } =
    paginationData(query);

  const whereClause = {};
  if (leadId) {
    whereClause.leadId = leadId;
  }

  const result = await model.LeadInvoice.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [[sortBy, orderby]],
  });

  // Enhance with invoice details
  result.rows = await Promise.all(
    result.rows.map(async (leadInvoice) => {
      const plainLeadInvoice = leadInvoice.get({ plain: true });

      const invoice = await modelAdministrative.Invoice.findOne({
        where: { id: plainLeadInvoice.invoiceId },
      });

      if (invoice) {
        plainLeadInvoice.invoice = invoice.get({ plain: true });
      }

      return plainLeadInvoice;
    })
  );

  return pagination(result, page, limit);
};

const getOne = async (id) => {
  return await getLeadInvoice(id);
};

const update = async (id, data) => {
  data.id = id;
  data = validate(updateLeadInvoiceValidation, data);
  const leadInvoice = await getLeadInvoice(id);

  console.log(data);
  throw new Error("test");
};

module.exports = {
  getAll,
  getOne,
  update,
  getLeadInvoice,
};
