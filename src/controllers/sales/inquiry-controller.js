const { paginationData } = require("../../helpers/func");
const inquiryService = require("../../services/sales/inquiry-service");

const getAll = async (req, res, next) => {
  try {
    const data = paginationData(req.query);

    // Add filtering parameters
    if (req.query.leadId) {
      data.leadId = req.query.leadId;
    }
    if (req.query.serviceId) {
      data.serviceId = req.query.serviceId;
    }
    if (req.query.salesPersonId) {
      data.salesPersonId = req.query.salesPersonId;
    }

    const result = await inquiryService.getAll(data);
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
    const result = await inquiryService.create(req.body);
    res.status(201).json({
      status: "success",
      message: "Inquiry created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const result = await inquiryService.getOne(req.params.id);
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateConsultancy = async (req, res, next) => {
  try {
    const result = await inquiryService.updateConsultancy(
      req.params.id,
      req.body
    );
    res.status(200).json({
      status: "success",
      message: "Inquiry updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateTraining = async (req, res, next) => {
  try {
    const result = await inquiryService.updateTraining(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      message: "Inquiry updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const destroy = async (req, res, next) => {
  try {
    await inquiryService.destroy(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const destroyMany = async (req, res, next) => {
  try {
    const result = await inquiryService.destroyMany(req.body);
    res.status(200).json({
      status: "success",
      message: `${result} inquiry(ies) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

const generateProposal = async (req, res, next) => {
  try {
    const result = await inquiryService.generateProposal(req.params.id, req.user.userId);
    res.status(200).json({
      status: "success",
      message: "Proposal generated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  create,
  getOne,
  updateConsultancy,
  updateTraining,
  destroy,
  destroyMany,
  generateProposal,
};
