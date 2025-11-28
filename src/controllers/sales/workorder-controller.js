const { paginationData } = require("../../helpers/func");
const workorderService = require("../../services/sales/workorder-service");

const getAll = async (req, res, next) => {
  try {
    const data = paginationData(req.query);
    data.userId = req.query.userId;

    const result = await workorderService.getAll(data);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await workorderService.getOne(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const generateWorkorder = async (req, res, next) => {
  try {
    req.body.issuerId = req.user.userId;
    const result = await workorderService.generateWorkOrder(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const generateWorkorderMany = async (req, res, next) => {
  try {
    req.body.issuerId = req.user.userId;
    await workorderService.generateWorkOrderMany(req.body);
    res.status(200).json({
      success: true,
      message: "Workorders generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const setCompensation = async (req, res, next) => {
  try {
    const { id } = req.params;
    await workorderService.setCompensation(id, req.body);
    res.status(200).json({
      success: true,
      message: "Compensation set successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    await workorderService.updateStatus(id, req.body);
    res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const sendWorkOrder = async (req, res, next) => {
  try {
    const { id, workorderId } = req.params;
    const result = await workorderService.sendWorkOrder(id, workorderId);
    res.status(200).json({
      success: true,
      message: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getOne,
  generateWorkorder,
  generateWorkorderMany,
  setCompensation,
  updateStatus,
  sendWorkOrder,
};
