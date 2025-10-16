const { paginationData } = require("../../helpers/func");
const documentReviewService = require("../../services/compliance/document-review-service");

const getAll = async (req, res, next) => {
  try {
    const data = paginationData(req.query);
    const result = await documentReviewService.getAll(data);

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
    const result = await documentReviewService.getOne(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const setNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await documentReviewService.setNotes(id, req.body);

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
  setNotes,
};
