const model = require("../../models/index");
const {
  searchData,
  pagination,
  getDataById,
  checkDataExists,
} = require("../../helpers/func");
const { Op } = require("sequelize");
const { ResponseError } = require("../../errors/response-error");
const validate = require("../../validations/validation");
const {
  createLeadContactValidation,
  updateLeadContactValidation,
  deleteLeadContactManyValidation,
} = require("../../validations/sales/lead-contact-validation");

const getData = async (id) => {
  return await getDataById("LeadContact", id, "Lead contact not found");
};

const getAll = async (data) => {
  const { page, limit, offset, orderby, sortBy, search, leadId } = data;
  const fieldSearch = searchData(
    ["fullname", "designation", "email", "phoneNumber"],
    search
  );

  let whereClause = { ...fieldSearch };

  // Filter by leadId if provided
  if (leadId) {
    whereClause.leadId = leadId;
  }

  const result = await model.LeadContact.findAndCountAll({
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
  data = validate(createLeadContactValidation, data);

  // Check if lead exists
  const leadExists = await checkDataExists("Lead", { id: data.leadId });
  if (!leadExists) {
    throw new ResponseError(404, "Lead not found");
  }

  return await model.LeadContact.create(data);
};

const getOne = async (id) => {
  const leadContact = await model.LeadContact.findOne({
    where: { id },
    include: [
      {
        model: model.Lead,
        as: "lead",
      },
    ],
  });

  if (!leadContact) {
    throw new ResponseError(404, "Lead contact not found");
  }

  return leadContact;
};

const update = async (id, data) => {
  data.id = id;
  data = validate(updateLeadContactValidation, data);

  await getData(id);

  // Check if lead exists if leadId is being updated
  if (data.leadId) {
    const leadExists = await checkDataExists("Lead", { id: data.leadId });
    if (!leadExists) {
      throw new ResponseError(404, "Lead not found");
    }
  }

  const [affectedRows] = await model.LeadContact.update(data, {
    where: { id },
  });

  if (affectedRows === 0) {
    throw new ResponseError(404, "Lead contact not found or no changes made");
  }

  return await getOne(id);
};

const destroy = async (id) => {
  await getData(id);
  return await model.LeadContact.destroy({
    where: { id },
  });
};

const destroyMany = async (data) => {
  data = validate(deleteLeadContactManyValidation, data);
  return await model.LeadContact.destroy({
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
