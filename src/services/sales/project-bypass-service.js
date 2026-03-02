const { Op } = require("sequelize");
const model = require("../../models/index");
const modelMasterdata = require("../../models/masterdata/index");
const modelAdministrative = require("../../models/administrative/index");
const validate = require("../../validations/validation");
const { ResponseError } = require("../../errors/response-error");
const {
  searchData,
  pagination,
  generateTrainingCode,
  syncDataHasMany,
  generateTrainingCertificateCode,
  encryptWithBase64,
  decryptWithBase64,
  getTrainingCourse,
  generateProjectCode,
} = require("../../helpers/func");
const {
  SERVICES,
  PROJECT_STATUS,
} = require("../../enum/utils");
const { createProjectValidation, updateProjectValidation, createTrainingCertificatestValidation, updateTrainingCertificatestValidation, importProjectValidation } = require("../../validations/sales/project-bypass-validation");
const { v4: uuidv4, validate: uuidValidate } = require("uuid");
const TOKEN_KEY = process.env.TOKEN_KEY || "BismillahBerkah!!!";

const getLead = async (id) => {
  const lead = await model.Lead.findOne({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    where: { id },
  });

  if (!lead) {
    throw new ResponseError(404, "lead not found");
  }

  return lead;
};

const getProject = async (id) => {
  const project = await model.Project.findOne({
    include: [
      {
        model: model.Training,
        as: "training",
        raw: true,
        include: [
          {
            model: model.TrainingClass,
            as: "trainingClasses",
            attributes: { exclude: ["createdAt", "updatedAt"] },
            raw: true,
            include: [
              {
                model: model.TrainingCertificate,
                as: "trainingCertificates",
                raw: true,
                order: [["code", "ASC"]],
                attributes: { exclude: ["createdAt", "updatedAt"] },
              }
            ]
          },
        ]
      },
    ],
    where: { id },
  });

  if (!project) {
    throw new ResponseError(404, "project not found");
  }

  const plainProject = project.get({ plain: true });
  const service = await modelMasterdata.Service.findOne({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    where: { id: plainProject.serviceId },
    raw: true
  });
    
  const trainingCourse = await getTrainingCourse(plainProject.training.trainingCourseId);
  plainProject.training.trainingCourse = trainingCourse;
  
  plainProject.service = service;
  return plainProject;
};

const getService = async (serviceId) => {
  const service = await modelMasterdata.Service.findOne({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    where: { id: serviceId },
  });

  if (!service) {
    throw new ResponseError(404, "Service not found");
  }

  return service;
};

const getTrainingCertificate = async (id) => {
  const trainingCertificate = await model.TrainingCertificate.findOne({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    where: { id },
  });

  if (!trainingCertificate) {
    throw new ResponseError(404, "training certificate not found");
  }

  return trainingCertificate;
};

const getTrainingClass = async (id) => {
  const trainingClass = await model.TrainingClass.findOne({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    where: { id },
  });

  if (!trainingClass) {
    throw new ResponseError(404, "training class not found");
  }

  return trainingClass;
};


// CORE SERVICE

const getAll = async (data) => {
  const { page, limit, offset, orderby, sortBy, search, leadId } = data;
  const fieldSearch = searchData(["code"], search);
  
  const result = await model.Project.findAndCountAll({
    where: {
      ...fieldSearch,
      ...(leadId ? { leadId } : {}),
    },
    include: [
      {
        model: model.Training,
        as: "training",
        include: [
          {
            model: model.TrainingClass,
            as: "trainingClasses",
          },
        ],
      },
    ],
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

      const trainingCourse = await getTrainingCourse(plainProject.training.trainingCourseId);
      
      plainProject.training.trainingCourse = trainingCourse;
      plainProject.service = service ? service.get({ plain: true }) : null;
      return plainProject;
    })
  );

  return pagination(result, page, limit);
};

const create = async (data) => {
  data = validate(createProjectValidation, data);

  // Check if lead and service exists
  await getLead(data.leadId);
  const service = await getService(data.serviceId);

  return await model.sequelize.transaction(async (transaction) => {
    const projectPayload = {};

    switch(service.name) {
      case SERVICES.TRAINING:
        const trainingPayload = data.training;
        const {code, runningNumber} = await generateTrainingCode(transaction);

        trainingPayload.code = code;
        trainingPayload.runningNumber = runningNumber;
        const training = await model.Training.create(trainingPayload, { 
          include: [
            {
              model: model.TrainingClass,
              as: "trainingClasses",
            },
          ],
          transaction
         });

        //  assign training id
        projectPayload.trainingId = training.id;
        
        break;
      default:
        throw new ResponseError(400, "Another service not implemented yet");
    }

    // Create project
    const {code, runningNumber} = await generateProjectCode(transaction);

    projectPayload.code = code;
    projectPayload.runningNumber = runningNumber;
    projectPayload.leadId = data.leadId;
    projectPayload.serviceId = data.serviceId;
    projectPayload.status = PROJECT_STATUS.COMPLETED;
    await model.Project.create(projectPayload, { transaction });

    return "Project created successfully";
  })
};

const importProject = async (data) => {
  data = validate(importProjectValidation, data);

  // Check if lead and service exists
  await getLead(data.leadId);
  const service = await getService(data.serviceId);
  const serviceName = service.name;

  return await model.sequelize.transaction(async (transaction) => {
    switch(serviceName) {
      case SERVICES.TRAINING:
        const trainings = data.trainings;
        for (const trainingPayload of trainings) {
          const training = await model.Training.create(trainingPayload, { 
            include: [
              {
                model: model.TrainingClass,
                as: "trainingClasses",
              },
            ],
            transaction
           });

           await model.Project.create({
            leadId: data.leadId,
            serviceId: data.serviceId,
            trainingId: training.id
           }, { transaction });
        }
        
        break;
      default:
        throw new ResponseError(400, "Another service not implemented yet");
    }

    return "Project created successfully";
  })
};

const getOne = async (id) => {
  return await getProject(id);
};

const update = async (id, data) => {
  data.id = id;
  data = validate(updateProjectValidation, data);
  const service = await getService(data.serviceId);

  await getProject(id);
  return await model.sequelize.transaction(async (transaction) => {
    const projectPayload = {
      leadId: data.leadId,
      serviceId: data.serviceId,
    };
    
    switch(service.name) {
      case SERVICES.TRAINING:
        const trainingPayload = data.training;
        projectPayload.consultancyId = null;

        if (trainingPayload.id) {
          await model.Training.update(trainingPayload, {
            where: { id: trainingPayload.id },
            transaction,
          });

          const trainingClassPayload = trainingPayload.trainingClasses;
          if (trainingClassPayload && trainingClassPayload.length > 0) {
            for (const trainingClass of trainingClassPayload) {
              if (trainingClass.id) {
                await model.TrainingClass.update(trainingClass, {
                  where: { id: trainingClass.id },
                  transaction,
                });
              } else {
                trainingClass.trainingId = trainingPayload.id;
                const result = await model.TrainingClass.create(trainingClass, {
                  transaction,
                });

                trainingClass.id = result.id;
              }
            }

            // sync training classes
            await syncDataHasMany(
              {
                currentModel: model.TrainingClass,
                where: { trainingId: trainingPayload.id },
                data: trainingClassPayload,
              },
              transaction
            );
          }
        } else {
          // create new training
          const {code, runningNumber} = await generateTrainingCode(transaction);
          trainingPayload.code = code;
          trainingPayload.runningNumber = runningNumber;
          const training = await model.Training.create(trainingPayload, { 
            include: [
              {
                model: model.TrainingClass,
                as: "trainingClasses",
              },
            ],
            transaction
           });

          //  assign training id
          projectPayload.trainingId = training.id;
        }
        
        break;
      default:
        throw new ResponseError(400, "Another service not implemented yet");
    }
    
    // Update project
    await model.Project.update(projectPayload, { where: { id }, transaction });
        
    return "Project updated successfully";
  })
};

const destroy = async (id) => {
  const project = await getProject(id);
  return await model.sequelize.transaction(async (transaction) => {
    await model.Project.destroy({ where: { id }, transaction });

    if (project.trainingId) {
      await model.Training.destroy({ where: { id: project.trainingId }, transaction });
    }

    return "Project deleted successfully";
  })
};

const createTrainingCertificates = async (id, data) => {
  data = validate(createTrainingCertificatestValidation, data);
  const project = await getProject(id);
  await getTrainingClass(data.trainingClassId); 

  for (const certData of data.trainingCertificates) {
    const { runningNumber, code } = await generateTrainingCertificateCode(
      project.trainingId
    );

    await model.TrainingCertificate.create({
      trainingId: project.trainingId,
      createdById: data.createdById,
      trainingClassId: data.trainingClassId,
      certificateId: uuidv4(),
      runningNumber,
      code,
      ...certData,
    });
  }
};

const updateTrainingCertificate = async (id, trainingCertificateId, data) => {
  data = validate(updateTrainingCertificatestValidation, data);
  await getProject(id);
  await getTrainingCertificate(trainingCertificateId);

  return await model.TrainingCertificate.update(data, {
    where: { id: trainingCertificateId },
  });
};

const deleteTrainingCertificate = async (id, trainingCertificateId) => {
  await getProject(id);
  await getTrainingCertificate(trainingCertificateId);

  return await model.TrainingCertificate.destroy({
    where: { id: trainingCertificateId },
  });
};

const getOneTrainingCertificatePublic = async (hashCode) => {
  let whereClause = {};
  let decryptedCertNumber = null;
  
  // Cek apakah hashcode valid UUID
  if (uuidValidate(hashCode)) {
    whereClause = { certificateId: hashCode };
  } else {
    decryptedCertNumber = decryptWithBase64(
      hashCode,
      TOKEN_KEY
    );

    whereClause = { code: decryptedCertNumber };
  }
  
  const trainingCertificate = await model.TrainingCertificate.findOne({
    where: whereClause,
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: model.TrainingClass,
        as: "trainingClass",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: model.Training,
        as: "training",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      }
    ]
  });

  if (!trainingCertificate) {
    throw new ResponseError(404, "training certificate not found");
  }

  const plainData = trainingCertificate.get({ plain: true });

  if (plainData.training) {
    const trainingCourse = await getTrainingCourse(
      plainData.training.trainingCourseId
    );

    plainData.training.trainingCourse = trainingCourse;
  }

  return plainData;
};

const verifyTrainingCertificatePublic = async (id, code) => {
  await getProject(id);
  const trainingCertificate = await model.TrainingCertificate.findOne({
    attributes: { exclude: ["createdAt", "updatedAt"] },
    where: { code },
  });

  return trainingCertificate ? true : false;
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
