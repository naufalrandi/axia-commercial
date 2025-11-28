const model = require("../../models/index");
const modelMasterdata = require("../../models/masterdata/index");
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
  createBusinessProcessValidation,
  updateBusinessProcessValidation,
  deleteBusinessProcessManyValidation,
} = require("../../validations/sales/business-process-validation");

const getData = async (id) => {
  return await getDataById("BusinessProcess", id, "Business process not found");
};

const getAll = async (data) => {
  const { page, limit, offset, orderby, sortBy, search, leadId } = data;
  const fieldSearch = searchData(["name"], search);

  let whereClause = { ...fieldSearch };

  // Filter by leadId if provided
  if (leadId) {
    whereClause.leadId = leadId;
  }

  const result = await model.BusinessProcess.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: model.Lead,
        as: "lead",
        attributes: ["id", "name"],
      },
      {
        model: model.LeadLocation,
        as: "leadLocations",
        attributes: ["id", "leadId", "addressId"],
        through: { attributes: [] },
      },
    ],
    limit,
    offset,
    order: [[sortBy, orderby]],
  });

  result.rows = await Promise.all(
    result.rows.map(async (businessProcess) => {
      const plainBusinessProcess = businessProcess.get({ plain: true });
      plainBusinessProcess.processFunctions =
        await modelMasterdata.ProcessFunction.findAll({
          attributes: { exclude: ["createdAt", "updatedAt"] },
          where: {
            id: {
              [Op.in]: plainBusinessProcess.processFunctions.map(
                (func) => func.id
              ),
            },
          },
        }).then((funcs) => funcs.map((r) => r.get({ plain: true })));
      // plainBusinessProcess.leadLocations = await Promise.all(
      //   plainBusinessProcess.leadLocations.map(async (leadLocation) => {
      //     const plainLeadLocation = leadLocation.get({ plain: true });
      //     plainLeadLocation.address = await enrichAddressWithMasterdata(
      //       plainLeadLocation.addressId,
      //       modelMasterdata
      //     );
      //     return plainLeadLocation;
      //   })
      // );
      return plainBusinessProcess;
    })
  );

  return pagination(result, page, limit);
};

const create = async (data) => {
  data = validate(createBusinessProcessValidation, data);

  // Validate Lead exists
  const leadExists = await checkDataExists("Lead", { id: data.leadId });
  if (!leadExists) {
    throw new ResponseError(404, "Lead not found");
  }

  // Validate LeadLocations exist and belong to the same Lead
  if (data.leadLocations && data.leadLocations.length > 0) {
    for (const leadLocation of data.leadLocations) {
      const leadLocationExists = await model.LeadLocation.findOne({
        where: {
          id: leadLocation.id,
          leadId: data.leadId,
        },
      });
      if (!leadLocationExists) {
        throw new ResponseError(
          404,
          `Lead location ${leadLocation.id} not found or doesn't belong to the specified lead`
        );
      }
    }
  }

  // Validate ProcessFunctions exist
  if (data.processFunctions && data.processFunctions.length > 0) {
    for (const processFunction of data.processFunctions) {
      const processFunctionExists =
        await modelMasterdata.ProcessFunction.findOne({
          where: { id: processFunction.id },
        });
      if (!processFunctionExists) {
        throw new ResponseError(
          404,
          `Process function ${processFunction.id} not found`
        );
      }
    }
  }

  return await model.sequelize.transaction(async (t) => {
    // Extract leadLocations and processFunctions before creating BusinessProcess
    const { leadLocations, processFunctions, ...businessProcessData } = data;

    // Set processFunctions as array format for JSONB
    if (processFunctions) {
      businessProcessData.processFunctions = processFunctions;
    }

    const businessProcess = await model.BusinessProcess.create(
      businessProcessData,
      {
        transaction: t,
      }
    );

    // Create associations with LeadLocations
    if (leadLocations && leadLocations.length > 0) {
      const leadLocationAssociations = leadLocations.map((loc) => ({
        businessProcessId: businessProcess.id,
        leadLocationId: loc.id,
      }));

      await model.BusinessProcessLeadLocation.bulkCreate(
        leadLocationAssociations,
        {
          transaction: t,
        }
      );
    }

    return businessProcess;
  });
};

const getOne = async (id) => {
  const businessProcess = await model.BusinessProcess.findOne({
    where: { id },
    include: [
      {
        model: model.Lead,
        as: "lead",
        attributes: ["id", "name"],
      },
      {
        model: model.LeadLocation,
        as: "leadLocations",
        attributes: ["id", "leadId", "addressId"],
        through: { attributes: [] },
      },
    ],
  });

  if (!businessProcess) {
    throw new ResponseError(404, "Business process not found");
  }

  // Get detailed process function information from masterdata
  if (
    businessProcess.processFunctions &&
    businessProcess.processFunctions.length > 0
  ) {
    const processFunctionDetails =
      await modelMasterdata.ProcessFunction.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] },
        where: {
          id: {
            [Op.in]: businessProcess.processFunctions.map((func) => func.id),
          },
        },
      });

    businessProcess.processFunctions = processFunctionDetails.map((r) =>
      r.get({ plain: true })
    );
  }

  return businessProcess;
};

const update = async (id, data) => {
  data.id = id;
  data = validate(updateBusinessProcessValidation, data);

  const existingBusinessProcess = await getData(id);

  // Validate Lead exists if leadId is being updated
  if (data.leadId) {
    const leadExists = await checkDataExists("Lead", { id: data.leadId });
    if (!leadExists) {
      throw new ResponseError(404, "Lead not found");
    }
  }

  // Use leadId from existing business process if not provided in update
  const leadIdToValidate = data.leadId || existingBusinessProcess.leadId;

  // Validate LeadLocations exist and belong to the Lead
  if (data.leadLocations && data.leadLocations.length > 0) {
    for (const leadLocation of data.leadLocations) {
      const leadLocationExists = await model.LeadLocation.findOne({
        where: {
          id: leadLocation.id,
          leadId: leadIdToValidate,
        },
      });
      if (!leadLocationExists) {
        throw new ResponseError(
          404,
          `Lead location ${leadLocation.id} not found or doesn't belong to the specified lead`
        );
      }
    }
  }

  // Validate ProcessFunctions exist
  if (data.processFunctions && data.processFunctions.length > 0) {
    for (const processFunction of data.processFunctions) {
      const processFunctionExists =
        await modelMasterdata.ProcessFunction.findOne({
          where: { id: processFunction.id },
        });
      if (!processFunctionExists) {
        throw new ResponseError(
          404,
          `Process function ${processFunction.id} not found`
        );
      }
    }
  }

  return await model.sequelize.transaction(async (t) => {
    // Extract leadLocations and processFunctions before updating BusinessProcess
    const { leadLocations, processFunctions, ...businessProcessData } = data;

    // Set processFunctions as array format for JSONB if provided
    if (processFunctions) {
      businessProcessData.processFunctions = processFunctions;
    }

    const [affectedRows] = await model.BusinessProcess.update(
      businessProcessData,
      {
        where: { id },
        transaction: t,
      }
    );

    if (affectedRows === 0) {
      throw new ResponseError(
        404,
        "Business process not found or no changes made"
      );
    }

    // Update LeadLocation associations if provided
    if (leadLocations !== undefined) {
      // Remove existing associations
      await model.BusinessProcessLeadLocation.destroy({
        where: { businessProcessId: id },
        transaction: t,
      });

      // Create new associations
      if (leadLocations.length > 0) {
        const leadLocationAssociations = leadLocations.map((loc) => ({
          businessProcessId: id,
          leadLocationId: loc.id,
        }));

        await model.BusinessProcessLeadLocation.bulkCreate(
          leadLocationAssociations,
          {
            transaction: t,
          }
        );
      }
    }

    return await getOne(id);
  });
};

const destroy = async (id) => {
  await getData(id);
  return await model.BusinessProcess.destroy({
    where: { id },
  });
};

const destroyMany = async (data) => {
  data = validate(deleteBusinessProcessManyValidation, data);
  return await model.BusinessProcess.destroy({
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
