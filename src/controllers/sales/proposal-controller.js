const { paginationData } = require("../../helpers/func");
const proposalService = require("../../services/sales/proposal-service");

const getAll = async (req, res, next) => {
  try {
    const data = paginationData(req.query);
    data.userId = req.query.userId;

    const result = await proposalService.getAll(data);
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
    const result = await proposalService.getOne(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const setBillingContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await proposalService.setBillingContact(id, data);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateInvestmentFees = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await proposalService.updateInvestmentFees(id, data);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await proposalService.destroy(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const destroyMany = async (req, res, next) => {
  try {
    await proposalService.destroyMany(req.body);
    res.status(200).json({
      success: true,
      message: "Contracts deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const sendEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await proposalService.sendEmail(id, req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const resendEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await proposalService.resendEmail(id, req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOtp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await proposalService.getOtp(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await proposalService.verifyOtp(id, req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOnePublic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await proposalService.getOnePublic(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await proposalService.updateStatus(id, data);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getOne,
  setBillingContact,
  updateInvestmentFees,
  destroy,
  destroyMany,
  sendEmail,
  resendEmail,
  getOtp,
  verifyOtp,
  getOnePublic,
  updateStatus,
};
