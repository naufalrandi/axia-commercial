const { Op } = require("sequelize");
const model = require("../../models/index");
const modelMasterdata = require("../../models/masterdata/index");
const modelAdministrative = require("../../models/administrative/index");
const validate = require("../../validations/validation");
const { ResponseError } = require("../../errors/response-error");
const {
  searchData,
  pagination,
  getTrainingCourse,
  generateTrainingCertificateCode,
  syncDataHasMany,
  createHistory,
  createComments,
  getUser,
  generateWorkorderCode,
  getStandardsFromProject,
} = require("../../helpers/func");
const {
  SERVICES,
  PROJECT_STATUS,
  WORKORDER_STATUS,
} = require("../../enum/utils");
const { getLead } = require("./lead-service");
const {
  createTrainingCertificatesValidation,
  updateTrainingCertificatesValidation,
  updateTrainingClassesValidation,
  setConsultantsValidation,
  setDateMilestoneValidation,
  updateStatusMilestoneValidation,
  commentMilestoneValidation,
  uploadFilesValidation,
  generateWorkorderValidation,
  generateWorkorderManyValidation,
} = require("../../validations/sales/project-validation");

const getConsultancyProgram = async (id, files = null) => {
  const consultancyProgram = await modelMasterdata.ConsultancyProgram.findOne({
    where: { id },
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
    include: [
      {
        model: modelMasterdata.ConsultancyProgramDeliverable,
        as: "deliverables",
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
    ],
  });

  if (files && consultancyProgram) {
    const fileList = Array.isArray(files) ? files : JSON.parse(files);
    const enhancedDeliverables = consultancyProgram.deliverables.map(
      (deliverable) => {
        const deliverableData = deliverable.get({ plain: true });
        const fileHistory = fileList.filter(
          (file) => file.deliverableId === deliverableData.id
        );

        deliverableData.files = fileHistory;
        return deliverableData;
      }
    );

    consultancyProgram.deliverables = enhancedDeliverables;
  }

  return consultancyProgram ? consultancyProgram.get({ plain: true }) : null;
};

const getTraining = async (id) => {
  const training = await model.Training.findOne({
    where: { id },
    include: [
      {
        model: model.TrainingClass,
        as: "trainingClasses",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: model.TrainingCertificate,
        as: "trainingCertificates",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
    ],
  });

  if (training) {
    const plainTraining = training.get({ plain: true });
    plainTraining.trainingCourse = await getTrainingCourse(
      plainTraining.trainingCourseId
    );

    return plainTraining;
  }

  return null;
};

const getConsultancy = async (id) => {
  const consultancy = await model.Consultancy.findOne({
    where: { id },
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: model.BusinessProcess,
        as: "businessProcesses",
        attributes: { exclude: ["createdAt", "updatedAt"] },
        through: { attributes: [] },
      },
      {
        model: model.CertificationAddon,
        as: "certificationAddons",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: model.ConsulDeliveryMethod,
        as: "deliveryMethod",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: model.ConsulDeliverable,
        as: "deliverables",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: model.ConsulInvestmentFees,
        as: "investmentFees",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: model.ConsulAppendix,
        as: "appendix",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: model.ConsulFinancialPlan,
        as: "financialPlan",
        attributes: { exclude: ["createdAt", "updatedAt"] },
        include: [
          {
            model: model.Incentive,
            as: "incentives",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          {
            model: model.PersonnelCost,
            as: "personnelCosts",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          {
            model: model.NonpersonnelCost,
            as: "nonpersonnelCosts",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
      },
    ],
  });

  if (consultancy) {
    const consultancyMethod = await modelMasterdata.ConsultancyMethod.findOne({
      where: { id: consultancy.consultancyMethodId },
      attributes: {
        exclude: ["description", "durations", "createdAt", "updatedAt"],
      },
    });

    if (consultancyMethod) {
      consultancy.dataValues.consultancyMethod = consultancyMethod.get({
        plain: true,
      });
    }

    // Get standards
    const standardModels = await modelMasterdata.Standard.findAll({
      attributes: {
        exclude: ["schemeTagId", "type", "document", "createdAt", "updatedAt"],
      },
      where: {
        id: {
          [Op.in]: consultancy.standards.map((std) => std.id),
        },
      },
    });

    if (standardModels.length > 0) {
      consultancy.standards = standardModels.map((r) => r.get({ plain: true }));
    }

    // Enhance businessProcesses with processFunctions details
    const businessProcesses = consultancy.businessProcesses;
    const enhancedBusinessProcesses = await Promise.all(
      businessProcesses.map(async (bp) => {
        const businessProcess = bp.get({ plain: true });
        const processFunctionIds = businessProcess.processFunctions.map(
          (pf) => pf.id
        );

        let processFunctions = [];
        if (processFunctionIds.length > 0) {
          const processFunctionModels =
            await modelMasterdata.ProcessFunction.findAll({
              attributes: { exclude: ["createdAt", "updatedAt"] },
              where: {
                id: {
                  [Op.in]: processFunctionIds,
                },
              },
            });

          // Konversi hasil query ke plain data
          processFunctions = processFunctionModels.map((r) =>
            r.get({ plain: true })
          );
        }

        return {
          ...businessProcess,
          processFunctions,
        };
      })
    );

    if (consultancy.withCertification) {
      const certificationAddons = consultancy.dataValues.certificationAddons;
      const enhancedCertificationAddons = await Promise.all(
        certificationAddons.map(async (addon) => {
          const supplier = await modelAdministrative.Supplier.findOne({
            where: { id: addon.supplierId },
            attributes: {
              exclude: ["remarks", "createdAt", "updatedAt"],
            },
          });

          return {
            ...addon.get({ plain: true }),
            supplier: supplier ? supplier.get({ plain: true }) : null,
          };
        })
      );

      consultancy.dataValues.certificationAddons = enhancedCertificationAddons;
    }

    // Deliverables
    if (consultancy.deliverables) {
      const deliverables = consultancy.deliverables;
      const enhancedDeliverables = await Promise.all(
        deliverables.map(async (deliverable) => {
          const consultancyProgram = await getConsultancyProgram(
            deliverable.consultancyProgramId
          );

          return {
            ...deliverable.get({ plain: true }),
            consultancyProgram: consultancyProgram,
          };
        })
      );

      consultancy.dataValues.deliverables = enhancedDeliverables;
    }

    consultancy.dataValues.businessProcesses = enhancedBusinessProcesses;
    return consultancy.dataValues;
  }

  return null;
};

const createFiles = (
  currentFile,
  deliverableId,
  files,
  additionalData = {}
) => {
  const newHistoryEntry = {
    id: Date.now(),
    deliverableId,
    files,
    timestamp: new Date().toISOString(),
    details: additionalData,
  };

  let histories = [];
  if (currentFile) {
    if (Array.isArray(currentFile)) {
      histories = currentFile;
    } else if (typeof currentFile === "string") {
      try {
        const parsed = JSON.parse(currentFile);
        if (Array.isArray(parsed)) {
          histories = parsed;
        }
      } catch (error) {
        histories = [];
      }
    }
  }

  histories.push(newHistoryEntry);
  return JSON.stringify(histories);
};

const getMilestones = async (milestones) => {
  if (!milestones || milestones.length === 0) {
    return null;
  }

  const enhancedMilestones = await Promise.all(
    milestones.map(async (milestone) => {
      const milestoneData = milestone;
      if (milestoneData.deliverable) {
        const consultancyProgram = await getConsultancyProgram(
          milestoneData.deliverable.consultancyProgramId,
          milestoneData.files
        );

        milestoneData.deliverable.consultancyProgram = consultancyProgram;
      }

      delete milestoneData.files;
      return milestoneData;
    })
  );

  return enhancedMilestones;
};

const getWorkorders = async (workorders) => {
  if (!workorders || workorders.length === 0) {
    return null;
  }

  const enhancedworkorders = await Promise.all(
    workorders.map(async (workorder) => {
      const user = await getUser(workorder.userId);
      workorder.user = user;
      return workorder;
    })
  );

  return enhancedworkorders;
};

const getActivityLogs = async (activityLogs) => {
  if (!activityLogs || activityLogs.length === 0) {
    return null;
  }

  const enhancedActivityLogs = await Promise.all(
    activityLogs.map(async (activityLog) => {
      // Enhance users with user details
      activityLog.users = await modelAdministrative.User.findAll({
        attributes: { exclude: ["password", "createdAt", "updatedAt"] },
        where: {
          id: {
            [Op.in]: activityLog.users.map((user) => user.id),
          },
        },
        include: [
          {
            model: modelAdministrative.UserDetail,
            as: "userDetail",
            attributes: ["id", "fullname"],
          },
        ],
      });

      // Enhance users with user details
      activityLog.consultancyPrograms =
        await modelMasterdata.ConsultancyProgram.findAll({
          attributes: ["id", "title"],
          where: {
            id: {
              [Op.in]: activityLog.consultancyPrograms.map((user) => user.id),
            },
          },
          // include: [
          //   {
          //     model: modelMasterdata.ConsultancyProgramDeliverable,
          //     as: "deliverables",
          //     attributes: { exclude: ["createdAt", "updatedAt"] },
          //   },
          // ],
        });

      return activityLog;
    })
  );

  return enhancedActivityLogs;
};

const getProject = async (id) => {
  let result = await model.Project.findOne({
    where: { id },
    include: [
      {
        model: model.TeamRoster,
        as: "teamRosters",
        attributes: { exclude: ["projectId", "createdAt", "updatedAt"] },
      },
      {
        model: model.Milestone,
        as: "milestones",
        attributes: { exclude: ["projectId", "createdAt", "updatedAt"] },
        include: [
          {
            model: model.ConsulDeliverable,
            as: "deliverable",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
      },
      {
        model: model.WorkOrder,
        as: "workOrders",
        attributes: { exclude: ["projectId", "createdAt", "updatedAt"] },
      },
      {
        model: model.ActivityLog,
        as: "activityLogs",
        attributes: { exclude: ["projectId", "createdAt", "updatedAt"] },
      },
    ],
  });

  if (!result) throw new ResponseError(404, "Proposal not found");
  result = result.toJSON();

  if (result.leadId) {
    const service = await getLead(result.leadId);
    result.lead = service ? service : null;
  } else {
    result.lead = null;
  }

  if (result.serviceId) {
    const service = await modelMasterdata.Service.findOne({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      where: { id: result.serviceId },
      raw: true,
    });

    result.service = service;

    if (service) {
      switch (result.service.name) {
        case SERVICES.CONSULTANCY:
          result.consultancy = await getConsultancy(result.consultancyId);

          break;

        case SERVICES.TRAINING:
          result.training = await getTraining(result.trainingId);

          break;
      }
    }
  } else {
    result.service = null;
  }

  result.milestones = await getMilestones(result.milestones);
  result.workOrders = await getWorkorders(result.workOrders);
  result.activityLogs = await getActivityLogs(result.activityLogs);

  return result;
};

const getMilestone = async (id) => {
  const milestone = await model.Milestone.findOne({
    where: { id },
    raw: true,
  });

  if (!milestone) {
    throw new ResponseError(404, "Milestone not found");
  }

  return milestone;
};

const getTaskMilestones = (role) => {
  switch (role) {
    case "Team Leader":
      return [
        "Complete all assigned deliverables",
        "Coordinate with team members (if any)",
        "Complete the consultancy report",
      ];
    case "Team Member":
      return [
        "Complete all assigned deliverables",
        "Coordinate with team (if any)",
      ];
    default:
      return [];
  }
};

const getAll = async (data) => {
  const { page, limit, offset, orderby, sortBy, search, leadId } = data;
  const fieldSearch = searchData(["code"], search);

  const result = await model.Project.findAndCountAll({
    where: {
      ...fieldSearch,
      ...(leadId ? { leadId: leadId } : {}),
    },
    limit,
    offset,
    order: [[sortBy, orderby]],
  });

  result.rows = await Promise.all(
    result.rows.map(async (project) => {
      let plainProject = project.get({ plain: true });
      const service = await modelMasterdata.Service.findOne({
        attributes: { exclude: ["createdAt", "updatedAt"] },
        where: { id: plainProject.serviceId },
      });

      plainProject.service = service ? service.get({ plain: true }) : null;
      return plainProject;
    })
  );

  return pagination(result, page, limit);
};

const getOne = async (id) => {
  return await getProject(id);
};

const destroy = async (id) => {
  await getProject(id);
  return await model.Project.destroy({ where: { id } });
};

const destroyMany = async (data) => {
  data = validate(destroyManyValidation, data);
  return await model.Project.destroy({
    where: {
      id: {
        [Op.in]: data.ids,
      },
    },
  });
};

const createTrainingCertificates = async (id, data) => {
  data = validate(createTrainingCertificatesValidation, data);
  const project = await getProject(id);

  for (const certData of data.trainingCertificates) {
    const { runningNumber, code } = await generateTrainingCertificateCode(
      project.trainingId
    );

    await model.TrainingCertificate.create({
      trainingId: project.trainingId,
      createdById: data.createdById,
      runningNumber,
      code,
      ...certData,
    });
  }
};

const updateTrainingCertificate = async (id, trainingCertificateId, data) => {
  data = validate(updateTrainingCertificatesValidation, data);
  await getProject(id);

  const trainingCertificate = await model.TrainingCertificate.findOne({
    where: { id: trainingCertificateId },
  });

  if (!trainingCertificate) {
    throw new ResponseError(404, "Training Certificate not found");
  }

  return await trainingCertificate.update(data);
};

const deleteTrainingCertificate = async (id, trainingCertificateId) => {
  await getProject(id);
  const trainingCertificate = await model.TrainingCertificate.findOne({
    where: { id: trainingCertificateId },
  });

  if (!trainingCertificate) {
    throw new ResponseError(404, "Training Certificate not found");
  }

  return await trainingCertificate.destroy();
};

const deleteManyTrainingCertificate = async (id, data) => {
  data = validate(updateTrainingCertificatesValidation, data);
  const project = await getProject(id);

  return await model.TrainingCertificate.destroy({
    where: { ids: { [Op.in]: data.ids }, trainingId: project.trainingId },
  });
};

const updateTrainingClasses = async (id, data) => {
  data = validate(updateTrainingClassesValidation, data);
  const project = await getProject(id);

  const training = project.training;
  const trainingClasses = data.trainingClasses;
  return await model.sequelize.transaction(async (transaction) => {
    if (trainingClasses && trainingClasses.length > 0) {
      for (const trainingClass of trainingClasses) {
        if (trainingClass.id) {
          await model.TrainingClass.update(trainingClass, {
            where: { id: trainingClass.id },
            transaction,
          });
        } else {
          trainingClass.trainingId = training.id;
          const result = await model.TrainingClass.create(trainingClass, {
            transaction,
          });

          trainingClass.id = result.id;
        }
      }

      await syncDataHasMany(
        {
          currentModel: model.TrainingClass,
          where: { trainingId: training.id },
          data: trainingClasses,
        },
        transaction
      );
    }
  });
};

const setConsultantsPrograms = async (id, deliverableId, data) => {
  data = validate(setConsultantsValidation, data);
  const project = await getProject(id);

  if (project.service.name !== SERVICES.CONSULTANCY) {
    throw new ResponseError(400, "Project is not a consultancy service");
  }

  return await model.ConsulDeliverable.update(data, {
    where: { id: deliverableId },
  });
};

const setDateMilestone = async (projectId, milestoneId, data) => {
  data = validate(setDateMilestoneValidation, data);
  const project = await getProject(projectId);

  if (project.service.name !== SERVICES.CONSULTANCY) {
    throw new ResponseError(400, "Project is not a consultancy service");
  }

  const milestone = await getMilestone(milestoneId);
  if (!milestone.isKickoff && !milestone.isClossing) {
    throw new ResponseError(404, "Milestone is not kickoff or closing type");
  }

  return await model.Milestone.update(data, {
    where: { id: milestoneId },
  });
};

const updateStatusMilestone = async (projectId, milestoneId, data) => {
  data = validate(updateStatusMilestoneValidation, data);
  const project = await getProject(projectId);

  if (project.service.name !== SERVICES.CONSULTANCY) {
    throw new ResponseError(400, "Project is not a consultancy service");
  }

  const milestone = await getMilestone(milestoneId);
  const defaultMalestone = !milestone.isKickoff && !milestone.isClossing;
  if (!defaultMalestone) {
    if (!milestone.date)
      throw new ResponseError(400, "Milestone date is not set");
  }

  const logs = createHistory(
    milestone.logs,
    "Milestone status updated to " + data.status
  );

  data.logs = logs;
  return await model.Milestone.update(data, {
    where: { id: milestoneId },
  });
};

const comments = async (projectId, milestoneId, data) => {
  data = validate(commentMilestoneValidation, data);
  const project = await getProject(projectId);

  if (project.service.name !== SERVICES.CONSULTANCY) {
    throw new ResponseError(400, "Project is not a consultancy service");
  }

  const milestone = await getMilestone(milestoneId);
  const user = await getUser(data.userId);
  const comments = createComments(milestone.comments, data.comment || "", {
    user,
  });

  data.comments = comments;
  return await model.Milestone.update(data, {
    where: { id: milestoneId },
  });
};

const uploadFiles = async (projectId, milestoneId, data) => {
  data = validate(uploadFilesValidation, data);
  const project = await getProject(projectId);

  if (project.service.name !== SERVICES.CONSULTANCY) {
    throw new ResponseError(400, "Project is not a consultancy service");
  }

  const milestone = await getMilestone(milestoneId);
  const files = createFiles(milestone.files, data.deliverableId, data.files);
  return await model.Milestone.update(
    {
      files,
    },
    {
      where: { id: milestoneId },
    }
  );
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
  getProject,
  setConsultantsPrograms,
  setDateMilestone,
  updateStatusMilestone,
  comments,
  uploadFiles,
};
