const teamRosterService = require("../../services/sales/team-roster-service");

const getAll = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const result = await teamRosterService.getAll(projectId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createMany = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const result = await teamRosterService.createMany(projectId, req.body);
    res.status(201).json({
      success: true,
      message: "Team rosters created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateMany = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    await teamRosterService.updateMany(projectId, req.body);
    res.status(200).json({
      success: true,
      message: "Team rosters updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateOne = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const teamRosterId = req.params.teamRosterId;
    await teamRosterService.updateOne(projectId, teamRosterId, req.body);
    res.status(200).json({
      success: true,
      message: "Team roster updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const teamRosterId = req.params.teamRosterId;
    const result = await teamRosterService.getOne(projectId, teamRosterId);
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
    const projectId = req.params.id;
    const teamRosterId = req.params.teamRosterId;
    await teamRosterService.destroy(projectId, teamRosterId);
    res.status(200).json({
      success: true,
      message: "Team roster deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const destroyMany = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    await teamRosterService.destroyMany(projectId, req.body);
    res.status(200).json({
      success: true,
      message: "Team rosters deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  createMany,
  updateMany,
  getOne,
  destroy,
  destroyMany,
  updateOne,
};
