const model = require("../../models/index");
const modelAdminstrative = require("../../models/administrative/index");
const modelMasterdata = require("../../models/masterdata/index");
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
  createLeadLocationValidation,
  updateLeadLocationValidation,
  deleteLeadLocationManyValidation,
} = require("../../validations/sales/lead-location-validation");

const getData = async (id) => {
  return await getDataById("LeadLocation", id, "Lead location not found");
};

const getAll = async (data) => {
  const { page, limit, offset, orderby, sortBy, search, leadId } = data;

  let whereClause = {};

  // Filter by leadId if provided
  if (leadId) {
    whereClause.leadId = leadId;
  }

  const result = await model.LeadLocation.findAndCountAll({
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
  data = validate(createLeadLocationValidation, data);

  // Check if lead exists
  const leadExists = await checkDataExists("Lead", { id: data.leadId });
  if (!leadExists) {
    throw new ResponseError(404, "Lead not found");
  }

  const address = await modelAdminstrative.Address.create(data.address);
  data.addressId = address.id;

  return await model.LeadLocation.create(data);
};

const getOne = async (id) => {
  const leadLocation = await model.LeadLocation.findOne({
    where: { id },
    include: [
      {
        model: model.Lead,
        as: "lead",
      },
    ],
  }).then((res) => res.get({ plain: true }));

  if (!leadLocation) {
    throw new ResponseError(404, "Lead location not found");
  }

  leadLocation.address = await enrichAddressWithMasterdata(
    leadLocation.addressId,
    modelMasterdata
  );

  return leadLocation;
};

const update = async (id, data) => {
  data.id = id;
  data = validate(updateLeadLocationValidation, data);

  await getData(id);

  // Check if lead exists if leadId is being updated
  if (data.leadId) {
    const leadExists = await checkDataExists("Lead", { id: data.leadId });
    if (!leadExists) {
      throw new ResponseError(404, "Lead not found");
    }
  }

  const [affectedRows] = await model.LeadLocation.update(data, {
    where: { id },
  });

  if (affectedRows === 0) {
    throw new ResponseError(404, "Lead location not found or no changes made");
  }

  return await getOne(id);
};

const destroy = async (id) => {
  await getData(id);
  return await model.LeadLocation.destroy({
    where: { id },
  });
};

const destroyMany = async (data) => {
  data = validate(deleteLeadLocationManyValidation, data);
  return await model.LeadLocation.destroy({
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
