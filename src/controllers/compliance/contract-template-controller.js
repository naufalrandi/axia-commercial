const { paginationData } = require("../../helpers/func");
const contractTemplateService = require("../../services/compliance/contract-template-service");

const getAll = async (req, res, next) => {
  try {
    const data = paginationData(req.query);
    const result = await contractTemplateService.getAll(data);

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
    data.createdById = req.user?.userId;

    const result = await contractTemplateService.create(data);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const result = await contractTemplateService.getOne(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdById: req.user?.userId || 1, // Should come from auth middleware for audit
    };
    const result = await contractTemplateService.update(req.params.id, data);
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
    const result = await contractTemplateService.destroy(req.params.id);
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
    const result = await contractTemplateService.destroyMany(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const submit = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      approverId: req.user?.userId || 1,
    };
    const result = await contractTemplateService.submit(req.params.id, data);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const approve = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      approverId: req.user?.userId || 1,
    };
    const result = await contractTemplateService.approve(req.params.id, data);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const reject = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      approverId: req.user?.userId || 1, // Should come from auth middleware
    };
    const result = await contractTemplateService.reject(req.params.id, data);
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
  create,
  getOne,
  update,
  destroy,
  destroyMany,
  submit,
  approve,
  reject,
};
