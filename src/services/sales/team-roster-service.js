const { Op } = require("sequelize");
const model = require("../../models/index");
const validate = require("../../validations/validation");
const { ResponseError } = require("../../errors/response-error");
const {
  createManyTeamRosterValidation,
  updateManyTeamRosterValidation,
  deleteManyTeamRosterValidation,
  updateTeamRosterValidation,
} = require("../../validations/sales/team-roster-validation");
const { syncDataHasMany } = require("../../helpers/func");
const { getProject } = require("./project-service");
const { SERVICES } = require("../../enum/utils");

async function validateProject(projectId) {
  const project = await getProject(projectId);

  if (project?.service?.name !== SERVICES.CONSULTANCY) {
    throw new ResponseError(400, "Project is not a consultancy service");
  }

  return project;
}

const getAll = async (projectId) => {
  // Validate project exists
  await validateProject(projectId);

  const result = await model.TeamRoster.findAll({
    where: { projectId },
    order: [["createdAt", "DESC"]],
  });

  return result;
};

const createMany = async (projectId, data) => {
  data = validate(createManyTeamRosterValidation, data);
  await validateProject(projectId);

  return await model.sequelize.transaction(async (transaction) => {
    const teamRosters = data.teamRosters.map((roster) => ({
      projectId,
      ...roster,
    }));

    return await model.TeamRoster.bulkCreate(teamRosters, { transaction });
  });
};

const updateMany = async (projectId, data) => {
  data = validate(updateManyTeamRosterValidation, data);

  await validateProject(projectId);
  return await model.sequelize.transaction(async (transaction) => {
    for (const teamRoster of data.teamRosters) {
      if (teamRoster.id) {
        const existingRoster = await model.TeamRoster.findOne({
          where: { id: teamRoster.id, projectId },
          transaction,
        });

        if (!existingRoster) {
          throw new ResponseError(
            404,
            `Team roster with ID ${teamRoster.id} not found in this project`
          );
        }

        await existingRoster.update(teamRoster, { transaction });
      } else {
        const result = await model.TeamRoster.create(
          { projectId, ...teamRoster },
          { transaction }
        );

        teamRoster.id = result.id;
      }
    }

    await syncDataHasMany(
      {
        currentModel: model.TeamRoster,
        where: { projectId },
        data: data.teamRosters,
      },
      transaction
    );
  });
};

const updateOne = async (projectId, id, data) => {
  data = validate(updateTeamRosterValidation, data);
  await validateProject(projectId);

  const existingRoster = await model.TeamRoster.findOne({
    where: { id, projectId },
  });

  if (!existingRoster) {
    throw new ResponseError(404, "Team roster not found in this project");
  }

  return await existingRoster.update(data);
};

const getOne = async (projectId, id) => {
  await validateProject(projectId);

  const teamRoster = await model.TeamRoster.findOne({
    where: { id, projectId },
  });

  if (!teamRoster) {
    throw new ResponseError(404, "Team roster not found in this project");
  }

  return teamRoster;
};

const destroy = async (projectId, id) => {
  // Validate project exists
  await validateProject(projectId);

  const teamRoster = await model.TeamRoster.findOne({
    where: { id, projectId },
  });

  if (!teamRoster) {
    throw new ResponseError(404, "Team roster not found in this project");
  }

  return await model.TeamRoster.destroy({ where: { id, projectId } });
};

const destroyMany = async (projectId, data) => {
  data = validate(deleteManyTeamRosterValidation, data);

  // Validate project exists
  await validateProject(projectId);

  return await model.sequelize.transaction(async (transaction) => {
    const existingRosters = await model.TeamRoster.findAll({
      where: {
        id: { [Op.in]: data.ids },
        projectId,
      },
      transaction,
    });

    if (existingRosters.length !== data.ids.length) {
      throw new ResponseError(
        404,
        "Some team rosters not found in this project"
      );
    }

    return await model.TeamRoster.destroy({
      where: {
        id: { [Op.in]: data.ids },
        projectId,
      },
      transaction,
    });
  });
};

module.exports = {
  getAll,
  createMany,
  updateOne,
  getOne,
  updateMany,
  destroy,
  destroyMany,
};
