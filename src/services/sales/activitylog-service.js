const model = require("../../models/index");
const {
  paginationData,
  pagination,
  searchData,
} = require("../../helpers/func");
const { Op } = require("sequelize");
const { ResponseError } = require("../../errors/response-error");
const validate = require("../../validations/validation");
const {
  createActivityLogValidation,
  updateActivityLogValidation,
  deleteActivityLogManyValidation,
} = require("../../validations/sales/activitylog-validation");

const getActivityLog = async (id) => {
  const instance = await model.ActivityLog.findOne({
    where: { id },
    include: [
      {
        model: model.Project,
        as: "project",
      },
    ],
  });

  if (!instance) {
    throw new ResponseError(404, "ActivityLog not found");
  }

  return instance.get({ plain: true });
};

const getAll = async (query) => {
  const { page, limit, offset, orderby, sortBy, search, projectId } =
    paginationData(query);

  // allow searching by remarks by default
  const fieldSearch = searchData(["remarks"], search);
  const result = await model.ActivityLog.findAndCountAll({
    where: {
      ...fieldSearch,
      projectId,
    },
    limit,
    offset,
    order: [[sortBy, orderby]],
  });

  result.rows = result.rows.map((r) => r.get({ plain: true }));

  return pagination(result, page, limit);
};

const create = async (data) => {
  data = validate(createActivityLogValidation, data);
  return await model.ActivityLog.create(data);
};

const getOne = async (id) => {
  return await getActivityLog(id);
};

const update = async (id, data) => {
  data.id = id;
  data = validate(updateActivityLogValidation, data);

  await getActivityLog(id);

  const [affectedRows] = await model.ActivityLog.update(data, {
    where: { id },
  });

  if (affectedRows === 0) {
    throw new ResponseError(404, "ActivityLog not found or no changes made");
  }

  return await getActivityLog(id);
};

const destroy = async (id) => {
  await getActivityLog(id);
  return await model.ActivityLog.destroy({ where: { id } });
};

const destroyMany = async (data) => {
  data = validate(deleteActivityLogManyValidation, data);

  return await model.ActivityLog.destroy({
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
  getActivityLog,
};
