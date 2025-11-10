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
  syncBusinessProcessValidation,
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

  result.rows = await Promise.all(
    result.rows.map(async (leadLocation) => {
      const plainLeadLocation = leadLocation.get({ plain: true });
      plainLeadLocation.address = await enrichAddressWithMasterdata(
        plainLeadLocation.addressId,
        modelMasterdata
      );
      return plainLeadLocation;
    })
  );

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
      {
        model: model.BusinessProcess,
        as: "businessProcesses",
        attributes: ["id", "name", "processFunctions"],
        through: { attributes: [] },
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

  if (leadLocation.businessProcesses.length > 0) {
    const processFunctionDetails =
      await modelMasterdata.ProcessFunction.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] },
        where: {
          id: {
            [Op.in]: leadLocation.businessProcesses
              .flatMap((bp) => bp.processFunctions)
              .map((pf) => pf.id),
          },
        },
      });

    leadLocation.businessProcesses.forEach((bp) => {
      bp.processFunctions = processFunctionDetails
        .filter((pf) => bp.processFunctions.some((bpf) => bpf.id === pf.id))
        .map((r) => r.get({ plain: true }));
    });
  }

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

const syncBusinessProcess = async (data) => {
  data = validate(syncBusinessProcessValidation, data);

  // Validate LeadLocation exists
  const leadLocation = await getData(data.leadLocationId);

  // Validate BusinessProcesses exist and belong to the same lead (if any provided)
  if (data.businessProcessIds.length > 0) {
    await Promise.all(
      data.businessProcessIds.map(async (businessProcessId) => {
        const businessProcess = await model.BusinessProcess.findOne({
          where: {
            id: businessProcessId,
            leadId: leadLocation.leadId,
          },
        });

        if (!businessProcess) {
          throw new ResponseError(
            404,
            `Business process ${businessProcessId} not found or doesn't belong to the same lead`
          );
        }

        return businessProcess;
      })
    );
  }

  return await model.sequelize.transaction(async (t) => {
    // Remove all existing associations for this lead location
    await model.BusinessProcessLeadLocation.destroy({
      where: {
        leadLocationId: data.leadLocationId,
      },
      transaction: t,
    });

    // Create new associations if businessProcessIds are provided
    if (data.businessProcessIds.length > 0) {
      const associations = data.businessProcessIds.map((businessProcessId) => ({
        businessProcessId,
        leadLocationId: data.leadLocationId,
      }));

      console.log("Associations to be created:", associations);

      await model.BusinessProcessLeadLocation.bulkCreate(associations, {
        transaction: t,
      });
    }

    // Return the lead location with updated business processes
    return await model.LeadLocation.findOne({
      where: { id: data.leadLocationId },
      include: [
        {
          model: model.Lead,
          as: "lead",
          attributes: ["id", "name"],
        },
        {
          model: model.BusinessProcess,
          as: "businessProcesses",
          attributes: ["id", "name", "processFunctions"],
          through: { attributes: [] },
        },
      ],
      transaction: t,
    });
  });
};

const getBusinessProcesses = async (leadLocationId) => {
  // Validate LeadLocation exists
  await getData(leadLocationId);

  return await model.LeadLocation.findOne({
    where: { id: leadLocationId },
    include: [
      {
        model: model.Lead,
        as: "lead",
        attributes: ["id", "name"],
      },
      {
        model: model.BusinessProcess,
        as: "businessProcesses",
        attributes: ["id", "name", "processFunctions"],
        through: { attributes: [] },
      },
    ],
  });
};

module.exports = {
  getAll,
  create,
  getOne,
  update,
  destroy,
  destroyMany,
  syncBusinessProcess,
  getBusinessProcesses,
};
