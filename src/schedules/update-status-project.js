const { Op } = require("sequelize");
const { PROJECT_STATUS, MILESTONE_STATUS } = require("../enum/utils");
const model = require("../models/index");

const setOngoingProjectConsultancy = async (todayStart, todayEnd) => {
  await model.sequelize.transaction(async (transaction) => {
    const kickoffMilestones = await model.Milestone.findAll({
      where: {
        isKickoff: true,
        status: MILESTONE_STATUS.PENDING,
        date: { [Op.between]: [todayStart, todayEnd] },
      },
      include: [
        {
          model: model.Project,
          as: "project",
          where: { status: PROJECT_STATUS.PENDING },
          attributes: ["id"],
        },
      ],
      attributes: ["id"],
    });

    if (kickoffMilestones.length > 0) {
      const ids = kickoffMilestones.map((m) => m.project.id);
      await model.Project.update(
        { status: PROJECT_STATUS.ONGOING },
        { where: { id: ids }, transaction }
      );
    }
  });
};

const setOngoingProjectTraining = async (todayStart, todayEnd) => {
  await model.sequelize.transaction(async (transaction) => {
    const trainings = await model.Training.findAll({
      attributes: ["id"],
      include: [
        {
          model: model.Project,
          as: "project",
          where: { status: PROJECT_STATUS.PENDING },
          attributes: ["id"],
        },
        {
          model: model.TrainingClass,
          as: "trainingClasses",
          where: {
            startDate: { [Op.between]: [todayStart, todayEnd] },
          },
          attributes: ["id"],
        },
      ],
    });

    if (trainings.length > 0) {
      const ids = trainings.map((t) => t.project.id);
      await model.Project.update(
        { status: PROJECT_STATUS.ONGOING },
        { where: { id: ids }, transaction }
      );
    }
  });
};

const setCompletedProjectConsultancy = async (todayStart, todayEnd) => {
  await model.sequelize.transaction(async (transaction) => {
    const closingMilestones = await model.Milestone.findAll({
      where: {
        isClossing: true,
        status: MILESTONE_STATUS.PENDING,
        date: { [Op.between]: [todayStart, todayEnd] },
      },
      include: [
        {
          model: model.Project,
          as: "project",
          where: { status: PROJECT_STATUS.ONGOING },
          attributes: ["id"],
        },
      ],
      attributes: ["id"],
    });

    if (closingMilestones.length > 0) {
      const ids = closingMilestones.map((m) => m.project.id);
      await model.Project.update(
        { status: PROJECT_STATUS.COMPLETED },
        { where: { id: ids }, transaction }
      );
    }
  });
};

const setCompletedProjectTraining = async (todayStart, todayEnd) => {
  await model.sequelize.transaction(async (transaction) => {
    const trainings = await model.Training.findAll({
      attributes: ["id"],
      include: [
        {
          model: model.Project,
          as: "project",
          where: { status: PROJECT_STATUS.ONGOING },
          attributes: ["id"],
        },
        {
          model: model.TrainingClass,
          as: "trainingClasses",
          where: {
            endDate: { [Op.between]: [todayStart, todayEnd] },
          },
          attributes: ["id"],
        },
      ],
    });

    if (trainings.length > 0) {
      const ids = trainings.map((t) => t.project.id);
      await model.Project.update(
        { status: PROJECT_STATUS.COMPLETED },
        { where: { id: ids }, transaction }
      );
    }
  });
};

async function updateStatusProject() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  await setOngoingProjectConsultancy(todayStart, todayEnd);
  await setOngoingProjectTraining(todayStart, todayEnd);
  await setCompletedProjectConsultancy(todayStart, todayEnd);
  await setCompletedProjectTraining(todayStart, todayEnd);
}

module.exports = { updateStatusProject };
