const Joi = require("joi");

const createTrainingCertificatesValidation = Joi.object({
  createdById: Joi.number().integer().positive().required(),
  trainingCertificates: Joi.array()
    .items(
      Joi.object({
        fullname: Joi.string().required(),
        email: Joi.string().email().required(),
      })
    )
    .min(1)
    .required(),
});

const updateTrainingCertificatesValidation = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().email().required(),
});

const deleteTrainingCertificatesManyValidation = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

const updateTrainingClassesValidation = Joi.object({
  trainingClasses: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().optional(),
        class: Joi.number().integer().positive().required(),
        deliveryMethod: Joi.string()
          .optional()
          .valid(
            "On-site at your organization's location",
            "AXIA training facility in Jakarta",
            "Online (Google Meet, Zoom, or Microsoft Teams)"
          ),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
      })
    )
    .min(1)
    .required(),
});

const setConsultantsValidation = Joi.object({
  consultants: Joi.array()
    .items(
      Joi.object({
        userId: Joi.number().integer().positive().required(),
        month: Joi.number().integer().positive().required(),
      })
    )
    .min(1)
    .required(),
});

const setDateMilestoneValidation = Joi.object({
  date: Joi.date().required(),
});

const updateStatusMilestoneValidation = Joi.object({
  status: Joi.string()
    .valid("Draft", "Pending", "Approved", "Rejected")
    .required(),
  reason: Joi.string().allow(null, "").optional(),
});

const commentMilestoneValidation = Joi.object({
  userId: Joi.number().integer().positive().required(),
  comment: Joi.string().required(),
});

const uploadFilesValidation = Joi.object({
  deliverableId: Joi.number().integer().positive().required(),
  files: Joi.array().min(1).required(),
});

const generateWorkorderValidation = Joi.object({
  projectId: Joi.string().uuid().required(),
  userId: Joi.number().integer().positive().required(),
  issuerId: Joi.number().integer().positive().required(),
  otherInformation: Joi.string().optional().allow(""),
  innerCityTravel: Joi.object({
    name: Joi.string().optional().allow(""),
    remarks: Joi.string().optional().allow(""),
  }),
  interCityTravel: Joi.object({
    name: Joi.string().optional().allow(""),
    remarks: Joi.string().optional().allow(""),
  }),
  accomodation: Joi.object({
    name: Joi.string().optional().allow(""),
    remarks: Joi.string().optional().allow(""),
  }),
  meals: Joi.object({
    name: Joi.string().optional().allow(""),
    remarks: Joi.string().optional().allow(""),
  }),
  personalProtectiveEquipment: Joi.object({
    name: Joi.string().optional().allow(""),
    remarks: Joi.string().optional().allow(""),
  }),
  accessClearance: Joi.object({
    name: Joi.string().optional().allow(""),
    remarks: Joi.string().optional().allow(""),
  }),
  rate: Joi.number().positive().required(),
  totalRate: Joi.number().positive().required(),
  incomeTaxDeducation: Joi.number().min(0).required(),
  totalFeesPaid: Joi.number().min(0).required(),
  paymentTermAndCondition: Joi.required(),
});

const generateWorkorderManyValidation = Joi.object({
  projectId: Joi.string().uuid().required(),
  issuerId: Joi.number().integer().positive().required(),
  otherInformation: Joi.string().optional().allow(""),
  innerCityTravel: Joi.object({
    name: Joi.string().optional().allow(""),
    remarks: Joi.string().optional().allow(""),
  }),
  interCityTravel: Joi.object({
    name: Joi.string().optional().allow(""),
    remarks: Joi.string().optional().allow(""),
  }),
  accomodation: Joi.object({
    name: Joi.string().optional().allow(""),
    remarks: Joi.string().optional().allow(""),
  }),
  meals: Joi.object({
    name: Joi.string().optional().allow(""),
    remarks: Joi.string().optional().allow(""),
  }),
  personalProtectiveEquipment: Joi.object({
    name: Joi.string().optional().allow(""),
    remarks: Joi.string().optional().allow(""),
  }),
  accessClearance: Joi.object({
    name: Joi.string().optional().allow(""),
    remarks: Joi.string().optional().allow(""),
  }),
});

const setCompensationValidation = Joi.object({
  rate: Joi.number().positive().required(),
  totalRate: Joi.number().positive().required(),
  incomeTaxDeducation: Joi.number().min(0).required(),
  totalFeesPaid: Joi.number().min(0).required(),
  paymentTermAndCondition: Joi.required(),
});

const updateStatusWorkorderValidation = Joi.object({
  status: Joi.string().valid("Pending", "Accepted", "Rejected").required(),
  reason: Joi.string().allow(null, "").optional(),
});

const sendWorkorderValidation = Joi.object({
  // No additional fields required for sending, just validation placeholder
});

module.exports = {
  createTrainingCertificatesValidation,
  updateTrainingCertificatesValidation,
  deleteTrainingCertificatesManyValidation,
  updateTrainingClassesValidation,
  setConsultantsValidation,
  setDateMilestoneValidation,
  updateStatusMilestoneValidation,
  commentMilestoneValidation,
  uploadFilesValidation,
  generateWorkorderValidation,
  generateWorkorderManyValidation,
  setCompensationValidation,
  updateStatusWorkorderValidation,
  sendWorkorderValidation,
};
