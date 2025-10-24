const model = require("../../models/index");
const modelMasterdata = require("../../models/masterdata/index");
const {
  searchData,
  pagination,
  getDataById,
  checkDataExists,
  generateLeadCode,
  checkLegalEntityType,
  checkIafCodes,
} = require("../../helpers/func");
const { Op } = require("sequelize");
const { ResponseError } = require("../../errors/response-error");
const validate = require("../../validations/validation");
const {
  createLeadValidation,
  updateLeadValidation,
  deleteLeadManyValidation,
} = require("../../validations/sales/lead-validation");

const getLead = async (id) => {
  const lead = await model.Lead.findOne({
    where: { id },
    include: [
      {
        model: model.LeadLocation,
        as: "locations",
      },
      {
        model: model.LeadContact,
        as: "contacts",
      },
      {
        model: model.LeadBillingContact,
        as: "billingContacts",
      },
    ],
  });

  if (!lead) {
    throw new ResponseError(404, "Lead not found");
  }

  if (lead.iafCodes.length > 0) {
    lead.iafCodes = await modelMasterdata.IafCode.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      where: {
        id: {
          [Op.in]: lead.iafCodes.map((code) => code.id),
        },
      },
    }).then((codes) => codes.map((r) => r.get({ plain: true })));
  }

  return lead;
};

const getAll = async (data) => {
  const { page, limit, offset, orderby, sortBy, search } = data;
  const fieldSearch = searchData(["name", "taxNumber", "website"], search);

  const result = await model.Lead.findAndCountAll({
    where: {
      ...fieldSearch,
    },
    limit,
    offset,
    order: [[sortBy, orderby]],
  });

  result.rows = await Promise.all(
    result.rows.map(async (lead) => {
      if (lead.iafCodes.length > 0) {
        lead.iafCodes = await modelMasterdata.IafCode.findAll({
          attributes: { exclude: ["createdAt", "updatedAt"] },
          where: {
            id: {
              [Op.in]: lead.iafCodes.map((code) => code.id),
            },
          },
        }).then((codes) => codes.map((r) => r.get({ plain: true })));
      }
      return lead;
    })
  );

  return pagination(result, page, limit);
};

const create = async (data) => {
  data = validate(createLeadValidation, data);

  // Validate legal entity type exists in masterdata
  const legalEntityTypeExists = await checkLegalEntityType(
    data.legalEntityTypeId
  );

  if (!legalEntityTypeExists) {
    throw new ResponseError(404, "Legal entity type not found in masterdata");
  }

  // Validate IAF codes exist in masterdata
  const iafCodesValid = await checkIafCodes(data.iafCodes);
  if (!iafCodesValid) {
    throw new ResponseError(
      404,
      "One or more IAF codes not found in masterdata"
    );
  }

  const { code, runningNumber } = await generateLeadCode();
  data.code = code;
  data.runningNumber = runningNumber;

  return await model.Lead.create(data);
};

const getOne = async (id) => {
  const lead = await getLead(id);
  return lead;
};

const update = async (id, data) => {
  data.id = id;
  data = validate(updateLeadValidation, data);

  await getLead(id);

  // Validate legal entity type exists in masterdata if being updated
  if (data.legalEntityTypeId) {
    const legalEntityTypeExists = await checkLegalEntityType(
      data.legalEntityTypeId
    );
    if (!legalEntityTypeExists) {
      throw new ResponseError(404, "Legal entity type not found in masterdata");
    }
  }

  // Validate IAF codes exist in masterdata if being updated
  if (data.iafCodes) {
    const iafCodesValid = await checkIafCodes(data.iafCodes);
    if (!iafCodesValid) {
      throw new ResponseError(
        404,
        "One or more IAF codes not found in masterdata"
      );
    }
  }

  const [affectedRows] = await model.Lead.update(data, {
    where: { id },
  });

  if (affectedRows === 0) {
    throw new ResponseError(404, "Lead not found or no changes made");
  }

  return await getOne(id);
};

const destroy = async (id) => {
  await getLead(id);
  return await model.Lead.destroy({
    where: { id },
  });
};

const destroyMany = async (data) => {
  data = validate(deleteLeadManyValidation, data);
  return await model.Lead.destroy({
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
