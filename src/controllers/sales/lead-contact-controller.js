const { paginationData } = require("../../helpers/func");
const leadContactService = require("../../services/sales/lead-contact-service");

const getAll = async (req, res, next) => {
  try {
    const data = paginationData(req.query);
    // Add leadId filter if provided in query
    if (req.query.leadId) {
      data.leadId = req.query.leadId;
    }

    const result = await leadContactService.getAll(data);

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

    const result = await leadContactService.create(data);
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
    const result = await leadContactService.getOne(req.params.id);
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
    const data = req.body;
    const result = await leadContactService.update(req.params.id, data);

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
    await leadContactService.destroy(req.params.id);
    res.status(200).json({
      success: true,
      message: "Lead contact deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const destroyMany = async (req, res, next) => {
  try {
    const result = await leadContactService.destroyMany(req.body);
    res.status(200).json({
      success: true,
      message: `${result} lead contacts deleted successfully`,
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
