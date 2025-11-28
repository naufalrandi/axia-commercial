const { paginationData } = require("../../helpers/func");
const activityLogService = require("../../services/sales/activitylog-service");

const getAll = async (req, res, next) => {
  try {
    const data = paginationData(req.query);
    data.projectId = req.params.id;
    const result = await activityLogService.getAll(data);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = req.body;
    data.projectId = req.params.id;
    const result = await activityLogService.create(data);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const { id, activityLogId } = req.params;
    const result = await activityLogService.getOne(activityLogId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id, activityLogId } = req.params;
    const data = req.body;
    data.projectId = id;
    const result = await activityLogService.update(activityLogId, data);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const destroy = async (req, res, next) => {
  try {
    const { id, activityLogId } = req.params;
    await activityLogService.destroy(activityLogId);
    res
      .status(200)
      .json({ success: true, message: "ActivityLog deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const destroyMany = async (req, res, next) => {
  try {
    await activityLogService.destroyMany(req.body);
    res
      .status(200)
      .json({ success: true, message: "ActivityLogs deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  create,
  getOne,
  update,
  destroy,
  destroyMany,
};
