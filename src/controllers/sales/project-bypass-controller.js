const { paginationData } = require("../../helpers/func");
const projectBypassService = require("../../services/sales/project-bypass-service");

const getAll = async (req, res, next) => {
  try {
    const data = paginationData(req.query);
    data.userId = req.query.userId;
    
    const result = await projectBypassService.getAll(data);
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
    const result = await projectBypassService.create(data);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const importProject = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await projectBypassService.importProject(data);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await projectBypassService.getOne(id);
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
    const data = req.body;
    const result = await projectBypassService.update(id, data);
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
    const result = await projectBypassService.destroy(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createTrainingCertificates = async (req, res, next) => {
  try {
    const data = req.body;
    data.createdById = req.user.userId;

    await projectBypassService.createTrainingCertificates(req.params.id, data);

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
    await projectBypassService.updateTrainingCertificate(
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
    await projectBypassService.deleteTrainingCertificate(
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

const getOneTrainingCertificatePublic = async (req, res, next) => {
  try {
    const result = await projectBypassService.getOneTrainingCertificatePublic(req.params.hashCode);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const verifyTrainingCertificatePublic = async (req, res, next) => {
  try {
    const code = req.body.code;
    const result = await projectBypassService.verifyTrainingCertificatePublic(code);

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
  importProject,
  createTrainingCertificates,
  updateTrainingCertificate,
  deleteTrainingCertificate,
  getOneTrainingCertificatePublic,
  verifyTrainingCertificatePublic
};
