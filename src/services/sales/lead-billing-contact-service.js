const model = require("../../models/index");
const modelMasterdata = require("../../models/masterdata/index");
const modelAdminstrative = require("../../models/administrative/index");
const {
  searchData,
  pagination,
  getDataById,
  checkDataExists,
  enrichAddressWithMasterdata,
} = require("../../helpers/func");
const { Op } = require("sequelize");
const { ResponseError } = require("../../errors/response-error");
const validate = require("../../validations/validation");
const {
  createLeadBillingContactValidation,
  updateLeadBillingContactValidation,
  deleteLeadBillingContactManyValidation,
} = require("../../validations/sales/lead-billing-contact-validation");

const getData = async (id) => {
  return await getDataById(
    "LeadBillingContact",
    id,
    "Lead billing contact not found"
  );
};

const getAll = async (data) => {
  const { page, limit, offset, orderby, sortBy, search, leadId } = data;
  const fieldSearch = searchData(["fullname", "phoneNumber", "email"], search);

  let whereClause = { ...fieldSearch };

  // Filter by leadId if provided
  if (leadId) {
    whereClause.leadId = leadId;
  }

  const result = await model.LeadBillingContact.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: model.Lead,
        as: "lead",
        attributes: ["id", "name"],
      },
    ],
    limit,
    offset,
    order: [[sortBy, orderby]],
  });

  return pagination(result, page, limit);
};

const create = async (data) => {
  data = validate(createLeadBillingContactValidation, data);
  const leadExists = await checkDataExists("Lead", { id: data.leadId });
  if (!leadExists) {
    throw new ResponseError(404, "Lead not found");
  }

  return await model.sequelize.transaction(async (t) => {
    const address = await modelAdminstrative.Address.create(data.address);

    data.addressId = address.id;
    const result = await model.LeadBillingContact.create(data, {
      transaction: t,
    });

    return result;
  });
};

const getOne = async (id) => {
  const leadBillingContact = await model.LeadBillingContact.findOne({
    where: { id },
    include: [
      {
        model: model.Lead,
        as: "lead",
      },
    ],
  }).then((res) => res.get({ plain: true }));

  if (!leadBillingContact) {
    throw new ResponseError(404, "Lead billing contact not found");
  }

  leadBillingContact.address = await enrichAddressWithMasterdata(
    leadBillingContact.addressId,
    modelMasterdata
  );

  return leadBillingContact;
};

const update = async (id, data) => {
  data.id = id;
  data = validate(updateLeadBillingContactValidation, data);

  const existingLeadBillingContact = await getData(id);

  if (data.leadId) {
    const leadExists = await checkDataExists("Lead", { id: data.leadId });
    if (!leadExists) {
      throw new ResponseError(404, "Lead not found");
    }
  }

  return await model.sequelize.transaction(async (t) => {
    // Update address if provided
    if (data.address) {
      await modelAdminstrative.Address.update(data.address, {
        where: { id: existingLeadBillingContact.addressId },
      });
      delete data.address; // Remove address from data as it's handled separately
    }

    const [affectedRows] = await model.LeadBillingContact.update(data, {
      where: { id },
      transaction: t,
    });

    if (affectedRows === 0) {
      throw new ResponseError(
        404,
        "Lead billing contact not found or no changes made"
      );
    }

    return await getOne(id);
  });
};

const destroy = async (id) => {
  await getData(id);
  return await model.LeadBillingContact.destroy({
    where: { id },
  });
};

const destroyMany = async (data) => {
  data = validate(deleteLeadBillingContactManyValidation, data);
  return await model.LeadBillingContact.destroy({
    where: {
      id: {
        [Op.in]: data.ids,
      },
    },
  });
};

module.exports = {
  getAll,
  create,
  getOne,
  update,
  destroy,
  destroyMany,
};
