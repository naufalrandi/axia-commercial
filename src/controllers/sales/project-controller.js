const { paginationData } = require("../../helpers/func");
const projectService = require("../../services/sales/project-service");

const getAll = async (req, res, next) => {
  try {
    const data = paginationData(req.query);
    data.userId = req.query.userId;

    const result = await projectService.getAll(data);
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
    const result = await projectService.getOne(id);
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
    const result = await projectService.destroy(id);
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
    await projectService.destroyMany(req.body);
    res.status(200).json({
      success: true,
      message: "Contracts deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const createTrainingCertificates = async (req, res, next) => {
  try {
    const data = req.body;
    data.createdById = req.user.userId;

    await projectService.createTrainingCertificates(req.params.id, data);

    res.status(200).json({
      success: true,
      message: "Training certificates created successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateTrainingCertificate = async (req, res, next) => {
  try {
    const data = req.body;
    await projectService.updateTrainingCertificate(
      req.params.id,
      req.params.trainingCertificateId,
      data
    );

    res.status(200).json({
      success: true,
      message: "Training certificate updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const deleteTrainingCertificate = async (req, res, next) => {
  try {
    await projectService.deleteTrainingCertificate(
      req.params.id,
      req.params.trainingCertificateId
    );

    res.status(200).json({
      success: true,
      message: "Training certificate delete successfully",
    });
  } catch (error) {
    next(error);
  }
};

const deleteManyTrainingCertificate = async (req, res, next) => {
  try {
    await projectService.deleteManyTrainingCertificate(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Training certificate delete successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateTrainingClasses = async (req, res, next) => {
  try {
    const data = req.body;
    await projectService.updateTrainingClasses(req.params.id, data);

    res.status(200).json({
      success: true,
      message: "Training classes updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const setConsultantsPrograms = async (req, res, next) => {
  try {
    const { id, deliverableId } = req.params;
    const result = await projectService.setConsultantsPrograms(
      id,
      deliverableId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const setDateMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const result = await projectService.setDateMilestone(
      id,
      milestoneId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatusMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const result = await projectService.updateStatusMilestone(
      id,
      milestoneId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const comments = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    req.body.userId = req.user.userId;
    const result = await projectService.comments(id, milestoneId, req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const uploadFiles = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const result = await projectService.uploadFiles(id, milestoneId, req.body);
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
  destroy,
  destroyMany,
  createTrainingCertificates,
  updateTrainingCertificate,
  deleteTrainingCertificate,
  deleteManyTrainingCertificate,
  updateTrainingClasses,
  setConsultantsPrograms,
  setDateMilestone,
  updateStatusMilestone,
  comments,
  uploadFiles,
};
