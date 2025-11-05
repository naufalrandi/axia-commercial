const businessProcessService = require("../../services/sales/business-process-service");

const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const orderby = req.query.orderby || "ASC";
    const sortBy = req.query.sortBy || "id";
    const search = req.query.search || "";
    const leadId = req.query.leadId || "";

    const data = {
      page,
      limit,
      offset,
      orderby,
      sortBy,
      search,
      leadId,
    };

    const result = await businessProcessService.getAll(data);
    res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const result = await businessProcessService.create(req.body);
    res.status(201).json({
      status: "success",
      message: "Business process created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const result = await businessProcessService.getOne(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Business process retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const result = await businessProcessService.update(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      message: "Business process updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const destroy = async (req, res, next) => {
  try {
    await businessProcessService.destroy(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Business process deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const destroyMany = async (req, res, next) => {
  try {
    const result = await businessProcessService.destroyMany(req.body);
    res.status(200).json({
      status: "success",
      message: `${result} business process(es) deleted successfully`,
    });
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