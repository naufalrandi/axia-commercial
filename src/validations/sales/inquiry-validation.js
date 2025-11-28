const Joi = require("joi");
const { asArray, PAYMENT_CONDITIONS } = require("../../enum/utils");

const createInquiryValidation = Joi.object({
  leadId: Joi.string().uuid().required(),
  serviceId: Joi.number().integer().positive().required(),
  consultancy: Joi.object({
    consultancyMethodId: Joi.number().integer().positive().required(),
    standards: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().uuid().required(),
        })
      )
      .required()
      .min(1),
    estimateStartDate: Joi.date().required(),
    serviceDuration: Joi.number().integer().positive().required(),
    businessProcesses: Joi.array()
      .items(
        Joi.object({
          businessProcessId: Joi.number().integer().positive().required(),
        })
      )
      .required(),
    withCertification: Joi.boolean().required(),
    certificationAddons: Joi.array()
      .items(
        Joi.object({
          supplierId: Joi.string().uuid().required(),
          address: Joi.string().required(),
          details: Joi.array()
            .items(
              Joi.object({
                standardId: Joi.string().uuid().required(),
                standardName: Joi.string().max(255).required(),
                maindaysY1: Joi.number().integer().positive().required(),
                maindaysY2: Joi.number().integer().positive().optional(),
                maindaysY3: Joi.number().integer().positive().optional(),
                price: Joi.number().integer().positive().required(),
              })
            )
            .required(),
        })
      )
      .optional()
      .allow(null),
  })
    .optional()
    .allow(null),
  inquiryTraining: Joi.object({
    trainings: Joi.array()
      .items(
        Joi.object({
          trainingCourseId: Joi.string().uuid().required(),
          courseMaterialFormat: Joi.string()
            .optional()
            .valid(
              "Digital format only",
              "Physical format only",
              "Digital and physical format"
            ),
          certificateFormat: Joi.string()
            .optional()
            .valid(
              "Digital format only",
              "Physical format only",
              "Digital and physical format"
            ),
          trainingClasses: Joi.array()
            .items(
              Joi.object({
                class: Joi.number().integer().positive().required(),
                // participant: Joi.number().integer().positive().required(),
                deliveryMethod: Joi.string()
                  .optional()
                  .valid(
                    "On-site at your organization's location",
                    "AXIA training facility in Jakarta",
                    "Online (Google Meet, Zoom, or Microsoft Teams)"
                  ),
              })
            )
            .min(1)
            .required(),
        })
      )
      .optional()
      .allow(null),
  })
    .optional()
    .allow(null),
});

const updateInquiryConsultancyValidation = Joi.object({
  consultancyMethodId: Joi.number().integer().positive().required(),
  standards: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().uuid().required(),
      })
    )
    .required()
    .min(1),
  estimateStartDate: Joi.date().required(),
  serviceDuration: Joi.number().integer().positive().required(),
  businessProcesses: Joi.array()
    .items(
      Joi.object({
        businessProcessId: Joi.number().integer().positive().required(),
      })
    )
    .required(),
  withCertification: Joi.boolean().required(),
  certificationAddons: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().optional(),
        supplierId: Joi.string().uuid().required(),
        address: Joi.string().required(),
        details: Joi.array()
          .items(
            Joi.object({
              standardId: Joi.string().uuid().required(),
              standardName: Joi.string().max(255).required(),
              maindaysY1: Joi.number().integer().positive().required(),
              maindaysY2: Joi.number().integer().positive().optional(),
              maindaysY3: Joi.number().integer().positive().optional(),
              price: Joi.number().integer().positive().required(),
            })
          )
          .required(),
      })
    )
    .optional()
    .allow(null),

  deliveryMethod: Joi.object({
    id: Joi.number().integer().positive().optional(),
    osCondition: Joi.string()
      .required()
      .valid("Up to", "Exactly", "Max", "Min"),
    osSessionAmount: Joi.number().required().positive(),
    osSessionUnit: Joi.string()
      .required()
      .valid("Minute", "Hour", "Day", "Week", "Month", "Year"),
    vcCondition: Joi.string()
      .required()
      .valid("Up to", "Exactly", "Max", "Min"),
    vcSessionAmount: Joi.number().required().positive(),
    vcSessionUnit: Joi.string()
      .required()
      .valid("Minute", "Hour", "Day", "Week", "Month", "Year"),
    textCommunication: Joi.string().optional().allow(""),
  }).required(),

  deliverables: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().positive().optional().allow(null),
      consultancyProgramId: Joi.number().integer().positive().required(),
      estimateDuration: Joi.number().integer().positive().required(),
      position: Joi.number().integer().positive().required(),
      month: Joi.number().integer().positive().required(),
    })
  ),

  investmentFees: Joi.object({
    id: Joi.number().integer().positive().optional(),
    details: Joi.required(),
    subTotal: Joi.number().required(),
    discount: Joi.number().required(),
    discountAmount: Joi.number().required(),
    vat: Joi.number().required(),
    vatAmount: Joi.number().required(),
    tax: Joi.number().required(),
    taxAmount: Joi.number().required(),
    grandTotal: Joi.number().required(),
  }),

  termAndConditions: Joi.required(),

  appendix: Joi.object({
    id: Joi.number().integer().positive().optional(),
    paymentTerms: Joi.array()
      .items(
        Joi.object({
          term: Joi.number().integer().positive().required(),
          rate: Joi.number().integer().positive().required(),
          days: Joi.number().integer().positive().required(),
          paymentCondition: Joi.object({
            triger: Joi.string()
              .valid(...asArray(PAYMENT_CONDITIONS))
              .required(),
            param: Joi.number().optional().allow(null),
          }).required(),
        })
      )
      .required(),
    innerCityTransportation: Joi.string()
      .required()
      .valid("Provided by the Client", "Provided by AXIA", "Not Provided"),
    interCityTransportation: Joi.string()
      .required()
      .valid("Provided by the Client", "Provided by AXIA", "Not Provided"),
    accomodation: Joi.string()
      .required()
      .valid("Provided by the Client", "Provided by AXIA", "Not Provided"),
    onsiteMeals: Joi.string()
      .required()
      .valid("Provided by the Client", "Provided by AXIA", "Not Provided"),
    offsiteMeals: Joi.string()
      .required()
      .valid("Provided by the Client", "Provided by AXIA", "Not Provided"),
  }),

  financialPlan: Joi.object({
    incentives: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().positive().optional().allow(null),
        userId: Joi.number().positive().required(),
        allocation: Joi.string()
          .required()
          .valid("Project Shares", "Sales Incentive"),
        rate: Joi.number().positive().required(),
        quantity: Joi.number().positive().required(),
        unit: Joi.string().required().valid("Contract"),
        amount: Joi.number().positive().required(),
      })
    ),
    personnelCosts: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().positive().optional().allow(null),
        userId: Joi.number().positive().required(),
        role: Joi.string()
          .required()
          .valid("Team Leader", "Team Member", "Project Manager"),
        rate: Joi.number().positive().required(),
        quantity: Joi.number().positive().required(),
        unit: Joi.string().required(),
        amount: Joi.number().positive().required(),
      })
    ),
    nonpersonnelCosts: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().positive().optional().allow(null),
        userId: Joi.number().positive().required(),
        description: Joi.string().required(),
        rate: Joi.number().positive().required(),
        quantity: Joi.number().positive().required(),
        unit: Joi.string().required().valid("Day", "Month", "Year", "Project"),
        amount: Joi.number().positive().required(),
      })
    ),
  }),
});

const updateInquiryTrainingValidation = Joi.object({
  trainings: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().uuid().optional(),
        trainingCourseId: Joi.string().uuid().required(),
        courseMaterialFormat: Joi.string()
          .optional()
          .valid(
            "Digital format only",
            "Physical format only",
            "Digital and physical format"
          ),
        certificateFormat: Joi.string()
          .optional()
          .valid(
            "Digital format only",
            "Physical format only",
            "Digital and physical format"
          ),
        trainingClasses: Joi.array()
          .items(
            Joi.object({
              id: Joi.number().integer().positive().optional(),
              class: Joi.number().integer().positive().required(),
              // participant: Joi.number().integer().positive().required(),
              deliveryMethod: Joi.string()
                .optional()
                .valid(
                  "On-site at your organization's location",
                  "AXIA training facility in Jakarta",
                  "Online (Google Meet, Zoom, or Microsoft Teams)"
                ),
            })
          )
          .min(1)
          .required(),
      })
    )
    .optional()
    .allow(null),

  investmentFees: Joi.object({
    id: Joi.number().integer().positive().optional(),
    details: Joi.required(),
    subTotal: Joi.number().required(),
    discount: Joi.number().required(),
    discountAmount: Joi.number().required(),
    vat: Joi.number().required(),
    vatAmount: Joi.number().required(),
    tax: Joi.number().required(),
    taxAmount: Joi.number().required(),
    grandTotal: Joi.number().required(),
  }),

  termAndConditions: Joi.required(),

  appendix: Joi.object({
    id: Joi.number().integer().positive().optional(),
    paymentTerms: Joi.array()
      .items(
        Joi.object({
          term: Joi.number().integer().positive().required(),
          rate: Joi.number().integer().positive().required(),
          days: Joi.number().integer().positive().required(),
          paymentCondition: Joi.object({
            triger: Joi.string()
              .valid(...asArray(PAYMENT_CONDITIONS))
              .required(),
            param: Joi.number().optional().allow(null),
          }).required(),
        })
      )
      .required(),
    innerCityTransportation: Joi.string()
      .required()
      .valid("Provided by the Client", "Provided by AXIA", "Not Provided"),
    interCityTransportation: Joi.string()
      .required()
      .valid("Provided by the Client", "Provided by AXIA", "Not Provided"),
    accomodation: Joi.string()
      .required()
      .valid("Provided by the Client", "Provided by AXIA", "Not Provided"),
    onsiteMeals: Joi.string()
      .required()
      .valid("Provided by the Client", "Provided by AXIA", "Not Provided"),
    offsiteMeals: Joi.string()
      .required()
      .valid("Provided by the Client", "Provided by AXIA", "Not Provided"),
  }),

  financialPlans: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().positive().optional(),
      trainingCourseId: Joi.string().uuid().required(),
      incentives: Joi.array().items(
        Joi.object({
          id: Joi.number().integer().positive().optional().allow(null),
          userId: Joi.number().positive().required(),
          allocation: Joi.string()
            .required()
            .valid("Project Shares", "Sales Incentive"),
          rate: Joi.number().positive().required(),
          quantity: Joi.number().positive().required(),
          unit: Joi.string().required().valid("Contract"),
          amount: Joi.number().positive().required(),
        })
      ),
      personnelCosts: Joi.array().items(
        Joi.object({
          id: Joi.number().integer().positive().optional().allow(null),
          userId: Joi.number().positive().required(),
          role: Joi.string()
            .required()
            .valid("Team Leader", "Team Member", "Project Manager"),
          rate: Joi.number().positive().required(),
          quantity: Joi.number().positive().required(),
          unit: Joi.string()
            .required()
            .valid("Day", "Month", "Year", "Project"),
          amount: Joi.number().positive().required(),
        })
      ),
      nonpersonnelCosts: Joi.array().items(
        Joi.object({
          id: Joi.number().integer().positive().optional().allow(null),
          userId: Joi.number().positive().required(),
          description: Joi.string().required(),
          rate: Joi.number().positive().required(),
          quantity: Joi.number().positive().required(),
          unit: Joi.string()
            .required()
            .valid("Day", "Month", "Year", "Project"),
          amount: Joi.number().positive().required(),
        })
      ),
    })
  ),
});

const deleteInquiryManyValidation = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

module.exports = {
  createInquiryValidation,
  updateInquiryConsultancyValidation,
  updateInquiryTrainingValidation,
  deleteInquiryManyValidation,
};
