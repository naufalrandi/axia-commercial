const { paginationData } = require("../../helpers/func");
const leadInvoiceService = require("../../services/sales/leadinvoice-service");

const getAll = async (req, res, next) => {
  try {
    const data = paginationData(req.query);
    data.leadId = req.query.leadId;

    const result = await leadInvoiceService.getAll(data);
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
    const result = await leadInvoiceService.getOne(id);
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
    const { id } = req.params;
    const result = await leadInvoiceService.update(id, req.body);
    res.status(200).json({
      success: true,
      data: result,
      message: "Lead Invoice updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getOne,
  update,
};
