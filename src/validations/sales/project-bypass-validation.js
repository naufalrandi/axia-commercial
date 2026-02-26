const Joi = require("joi");

const createProjectValidation = Joi.object({
  leadId: Joi.string().uuid().required(),
  serviceId: Joi.number().integer().positive().required(),
  training: Joi.object({
    trainingCourseId: Joi.string().uuid().required(),
    courseType: Joi.string().required(),
    courseMaterialFormat: Joi.string().required(),
    certificateFormat: Joi.string().required(),
    issuer: Joi.string().required(),
    trainingClasses: Joi.array().items(
      Joi.object({
        class: Joi.number().integer().positive().required(),
        deliveryMethod: Joi.string().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
      })
    ).min(1).required(),
  }).optional().allow(null),
});

const updateProjectValidation = Joi.object({
  id: Joi.string().uuid().required(),
  leadId: Joi.string().uuid().required(),
  serviceId: Joi.number().integer().positive().required(),
  training: Joi.object({
    id: Joi.string().uuid().optional(),
    trainingCourseId: Joi.string().uuid().required(),
    courseType: Joi.string().required(),
    courseMaterialFormat: Joi.string().required(),
    certificateFormat: Joi.string().required(),
    issuer: Joi.string().required(),
    trainingClasses: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().positive().optional(),
        class: Joi.number().integer().positive().required(),
        deliveryMethod: Joi.string().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
      })
    ).min(1).required(),
  }).optional().allow(null),
});

const importProjectValidation = Joi.object({
  leadId: Joi.string().uuid().required(),
  serviceId: Joi.number().integer().positive().required(),
  trainings: Joi.array().items(
    Joi.object({
      runningNumber: Joi.number().integer().positive().required(),
      trainingCourseCode: Joi.string().required(),
      code: Joi.string().required(),
      courseType: Joi.string().required(),
      courseMaterialFormat: Joi.string().required(),
      certificateFormat: Joi.string().required(),
      issuer: Joi.string().required(),
      trainingClasses: Joi.array().items(
        Joi.object({
          class: Joi.number().integer().positive().required(),
          deliveryMethod: Joi.string().required(),
          startDate: Joi.date().required(),
          endDate: Joi.date().required(),
        })
      ),
    })
  )
});

const createTrainingCertificatestValidation = Joi.object({
  trainingClassId: Joi.number().integer().positive().required(),
  createdById: Joi.number().integer().positive().required(),
  trainingCertificates: Joi.array().items(
    Joi.object({
      fullname: Joi.string().required(),
      email: Joi.string().optional().allow("", null),
    })
  ),
});

const updateTrainingCertificatestValidation = Joi.object({
  fullname: Joi.string().required(),
    email: Joi.string().optional().allow("", null),
});


module.exports = {
  createProjectValidation,
  updateProjectValidation,
  importProjectValidation,
  createTrainingCertificatestValidation,
  updateTrainingCertificatestValidation
};
