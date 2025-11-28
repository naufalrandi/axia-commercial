const model = require("../../models/index");
const modelAdministrative = require("../../models/administrative/index");
const modelMasterdata = require("../../models/masterdata/index");
const {
  searchData,
  pagination,
  getDataById,
  checkDataExists,
  syncDataHasMany,
  generateTrainingCode,
  generateInquiryCode,
  generateProposalCode,
  getTrainingCourse,
} = require("../../helpers/func");
const { Op } = require("sequelize");
const { ResponseError } = require("../../errors/response-error");
const validate = require("../../validations/validation");
const {
  createInquiryValidation,
  deleteInquiryManyValidation,
  updateInquiryConsultancyValidation,
  updateInquiryTrainingValidation,
} = require("../../validations/sales/inquiry-validation");
const { SERVICES, PROPOSAL_STATUS } = require("../../enum/utils");

const getData = async (id) => {
  return await getDataById("Inquiry", id, "Inquiry not found");
};

const getInquiry = async (id) => {
  const inquiry = await model.Inquiry.findOne({
    where: { id },
    include: [
      {
        model: model.Lead,
        as: "lead",
        attributes: ["id", "name"],
      },
    ],
  });

  if (!inquiry) {
    throw new ResponseError(404, "Inquiry not found");
  }

  // Get service details from masterdata
  if (inquiry.serviceId) {
    const service = await modelMasterdata.Service.findOne({
      where: { id: inquiry.serviceId },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (service) {
      inquiry.dataValues.service = service.get({ plain: true });
    }

    switch (service.name) {
      case SERVICES.CONSULTANCY:
        const consultancy = await model.Consultancy.findOne({
          where: { inquiryId: inquiry.id },
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
          const consultancyMethod =
            await modelMasterdata.ConsultancyMethod.findOne({
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
              exclude: [
                "schemeTagId",
                "type",
                "document",
                "createdAt",
                "updatedAt",
              ],
            },
            where: {
              id: {
                [Op.in]: consultancy.standards.map((std) => std.id),
              },
            },
          });

          if (standardModels.length > 0) {
            consultancy.standards = standardModels.map((r) =>
              r.get({ plain: true })
            );
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
            const certificationAddons =
              consultancy.dataValues.certificationAddons;
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

            consultancy.dataValues.certificationAddons =
              enhancedCertificationAddons;
          }

          consultancy.dataValues.businessProcesses = enhancedBusinessProcesses;
          inquiry.dataValues.consultancy = consultancy.dataValues;
        }

        break;

      case SERVICES.TRAINING:
        let inquiryTraining = await model.InquiryTraining.findOne({
          where: { inquiryId: inquiry.id },
          attributes: { exclude: ["createdAt", "updatedAt"] },
          include: [
            {
              model: model.Training,
              as: "trainings",
              attributes: { exclude: ["createdAt", "updatedAt"] },
              include: [
                {
                  model: model.TrainingClass,
                  as: "trainingClasses",
                  attributes: { exclude: ["createdAt", "updatedAt"] },
                },
              ],
            },
            {
              model: model.TrainInvestmentFees,
              as: "investmentFees",
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: model.TrainAppendix,
              as: "appendix",
              attributes: { exclude: ["createdAt", "updatedAt"] },
            },
            {
              model: model.TrainFinancialPlan,
              as: "financialPlans",
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
        }).then((res) => res.get({ plain: true }));

        if (inquiryTraining) {
          if (inquiryTraining.trainings.length > 0) {
            for (const training of inquiryTraining.trainings) {
              const trainingCourse = await getTrainingCourse(
                training.trainingCourseId
              );
              training.trainingCourse = trainingCourse;
            }
          }

          if (inquiryTraining.financialPlans.length > 0) {
            for (const trainFinancialPlan of inquiryTraining.financialPlans) {
              let trainingCourse = await modelMasterdata.TrainingCourse.findOne(
                {
                  where: { id: trainFinancialPlan.trainingCourseId },
                  attributes: { exclude: ["createdAt", "updatedAt"] },
                  include: [
                    {
                      model: modelMasterdata.Standard,
                      as: "standards",
                      attributes: { exclude: ["createdAt", "updatedAt"] },
                      through: { attributes: [] },
                      include: [
                        {
                          model: modelMasterdata.SchemeTag,
                          as: "schemeTag",
                          attributes: { exclude: ["createdAt", "updatedAt"] },
                        },
                      ],
                    },
                  ],
                }
              );

              trainingCourse = trainingCourse.get({ plain: true });
              trainFinancialPlan.trainingCourse = trainingCourse;
            }
          }
        }

        inquiry.dataValues.inquiryTraining = inquiryTraining;

        break;
      default:
        break;
    }
  }

  return inquiry.get({ plain: true });
};

const getAll = async (data) => {
  const {
    page,
    limit,
    offset,
    orderby,
    sortBy,
    search,
    leadId,
    serviceId,
    salesPersonId,
  } = data;
  const fieldSearch = searchData(["code"], search);

  let whereClause = { ...fieldSearch };

  // Filter by leadId if provided
  if (leadId) {
    whereClause.leadId = leadId;
  }

  // Filter by serviceId if provided
  if (serviceId) {
    whereClause.serviceId = serviceId;
  }

  // Filter by salesPersonId if provided
  if (salesPersonId) {
    whereClause.salesPersonId = salesPersonId;
  }

  const result = await model.Inquiry.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: model.Lead,
        as: "lead",
        attributes: ["id", "name"],
      },
    ],
    limit,
    offset,
    order: [[sortBy, orderby]],
  });

  return pagination(result, page, limit);
};

const create = async (data) => {
  data = validate(createInquiryValidation, data);
  const leadExists = await checkDataExists("Lead", { id: data.leadId });

  if (!leadExists) {
    throw new ResponseError(404, "Lead not found");
  }

  // Validate Service exists in masterdata
  let service = await modelMasterdata.Service.findOne({
    where: { id: data.serviceId },
  });

  if (!service) {
    throw new ResponseError(404, "Service not found");
  }

  service = service.get({ plain: true });
  return await model.sequelize.transaction(async (transaction) => {
    const { runningNumber, code } = await generateInquiryCode(
      service,
      transaction
    );

    data.code = code;
    data.runningNumber = runningNumber;
    const inquiry = await model.Inquiry.create(data, { transaction });

    switch (service.name) {
      case SERVICES.CONSULTANCY:
        const consultancyData = data.consultancy;
        if (!consultancyData) {
          throw new ResponseError(
            400,
            "Consultancy data is required for Consultancy service"
          );
        }

        const consultancy = await model.Consultancy.create(
          {
            ...consultancyData,
            inquiryId: inquiry.id,
          },
          { transaction }
        );

        if (consultancyData.businessProcesses) {
          for (const item of consultancyData.businessProcesses) {
            item.consultancyId = consultancy.id;
            await model.ConsultancyBusinessProcess.create(item, {
              transaction,
            });
          }
        }

        if (consultancyData.withCertification) {
          for (const item of consultancyData.certificationAddons) {
            const supplierExists = await modelAdministrative.Supplier.findOne({
              where: { id: item.supplierId },
            });

            if (!supplierExists) {
              throw new ResponseError(404, "Supplier not found");
            }

            item.consultancyId = consultancy.id;
            await model.CertificationAddon.create(item, { transaction });
          }
        }

        break;
      case SERVICES.TRAINING:
        const trainingData = data.inquiryTraining.trainings;
        if (!trainingData || trainingData.length === 0) {
          throw new ResponseError(
            400,
            "At least one training data is required for Training service"
          );
        }

        const inquiryTraining = await model.InquiryTraining.create(
          {
            inquiryId: inquiry.id,
          },
          { transaction }
        );

        for (const training of trainingData) {
          const { runningNumber, code } = await generateTrainingCode(
            transaction
          );

          training.code = code;
          training.inquiryTrainingId = inquiryTraining.id;
          training.runningNumber = runningNumber;
          training.courseType = "In-House Training";
          const trainingCreated = await model.Training.create(training, {
            transaction,
          });

          // Create training classes if provided
          if (training.trainingClasses && training.trainingClasses.length > 0) {
            for (const trainingClass of training.trainingClasses) {
              trainingClass.trainingId = trainingCreated.id;
              await model.TrainingClass.create(trainingClass, { transaction });
            }
          }
        }

        break;
      default:
        break;
    }

    return inquiry;
  });
};

const getOne = async (id) => {
  return await getInquiry(id);
};

const updateConsultancy = async (id, data) => {
  data = validate(updateInquiryConsultancyValidation, data);

  const inquiry = await getInquiry(id);
  const consultancy = inquiry.consultancy;

  return await model.sequelize.transaction(async (transaction) => {
    await model.Consultancy.update(data, {
      where: { inquiryId: inquiry.id },
      transaction,
    });

    if (data.businessProcesses) {
      await model.ConsultancyBusinessProcess.destroy({
        where: { consultancyId: consultancy.id },
        transaction,
      });

      for (const item of data.businessProcesses) {
        item.consultancyId = consultancy.id;
        await model.ConsultancyBusinessProcess.create(item, { transaction });
      }
    }

    if (data.withCertification) {
      for (const item of data.certificationAddons) {
        const supplierExists = await modelAdministrative.Supplier.findOne({
          where: { id: item.supplierId },
        });

        if (!supplierExists) {
          throw new ResponseError(404, "Supplier not found");
        }

        if (item.id) {
          await model.CertificationAddon.update(item, {
            where: { id: item.id },
            transaction,
          });
        } else {
          item.consultancyId = consultancy.id;
          const result = await model.CertificationAddon.create(item, {
            transaction,
          });

          item.id = result.id;
        }
      }

      await syncDataHasMany(
        {
          currentModel: model.CertificationAddon,
          where: { consultancyId: consultancy.id },
          data: data.certificationAddons,
        },
        transaction
      );
    }

    if (data.deliveryMethod) {
      const deliveryMethodData = data.deliveryMethod;
      if (deliveryMethodData.id) {
        await model.ConsulDeliveryMethod.update(deliveryMethodData, {
          where: { id: deliveryMethodData.id },
          transaction,
        });
      } else {
        await model.ConsulDeliveryMethod.destroy({
          where: { consultancyId: consultancy.id },
          transaction,
        });

        deliveryMethodData.consultancyId = consultancy.id;
        await model.ConsulDeliveryMethod.create(deliveryMethodData, {
          transaction,
        });
      }
    }

    if (data.deliverables) {
      const deliverablesData = data.deliverables;
      for (const item of deliverablesData) {
        if (item.id) {
          await model.ConsulDeliverable.update(item, {
            where: { id: item.id },
            transaction,
          });
        } else {
          item.consultancyId = consultancy.id;
          const result = await model.ConsulDeliverable.create(item, {
            transaction,
          });
          item.id = result.id;
        }
      }

      await syncDataHasMany(
        {
          currentModel: model.ConsulDeliverable,
          where: { consultancyId: consultancy.id },
          data: deliverablesData,
        },
        transaction
      );
    }

    if (data.investmentFees) {
      const investmentFeesData = data.investmentFees;
      if (investmentFeesData.id) {
        await model.ConsulInvestmentFees.update(investmentFeesData, {
          where: { id: investmentFeesData.id },
          transaction,
        });
      } else {
        await model.ConsulInvestmentFees.destroy({
          where: { consultancyId: consultancy.id },
          transaction,
        });

        investmentFeesData.consultancyId = consultancy.id;
        const result = await model.ConsulInvestmentFees.create(
          investmentFeesData,
          {
            transaction,
          }
        );
      }
    }

    if (data.appendix) {
      const appendixData = data.appendix;
      if (appendixData.id) {
        await model.ConsulAppendix.update(appendixData, {
          where: { id: appendixData.id },
          transaction,
        });
      } else {
        await model.ConsulAppendix.destroy({
          where: { consultancyId: consultancy.id },
          transaction,
        });

        appendixData.consultancyId = consultancy.id;
        await model.ConsulAppendix.create(appendixData, {
          transaction,
        });
      }
    }

    if (data.financialPlan) {
      const financialPlanData = data.financialPlan;
      if (!financialPlanData.id) {
        await model.ConsulFinancialPlan.destroy({
          where: { consultancyId: consultancy.id },
          transaction,
        });

        financialPlanData.consultancyId = consultancy.id;
        const financialPlan = await model.ConsulFinancialPlan.create(
          financialPlanData,
          { transaction }
        );

        financialPlanData.id = financialPlan.id;
      }

      if (financialPlanData.incentives) {
        for (const item of financialPlanData.incentives) {
          if (item.id) {
            await model.Incentive.update(item, {
              where: { id: item.id },
              transaction,
            });
          } else {
            item.financialPlanId = financialPlanData.id;
            const result = await model.Incentive.create(item, {
              transaction,
            });
            item.id = result.id;
          }
        }

        await syncDataHasMany(
          {
            currentModel: model.Incentive,
            where: { financialPlanId: financialPlanData.id },
            data: financialPlanData.incentives,
          },
          transaction
        );
      }

      if (financialPlanData.personnelCosts) {
        for (const item of financialPlanData.personnelCosts) {
          if (item.id) {
            await model.PersonnelCost.update(item, {
              where: { id: item.id },
              transaction,
            });
          } else {
            item.financialPlanId = financialPlanData.id;
            const result = await model.PersonnelCost.create(item, {
              transaction,
            });
            item.id = result.id;
          }
        }

        await syncDataHasMany(
          {
            currentModel: model.PersonnelCost,
            where: { financialPlanId: financialPlanData.id },
            data: financialPlanData.personnelCosts,
          },
          transaction
        );
      }

      if (financialPlanData.nonpersonnelCosts) {
        for (const item of financialPlanData.nonpersonnelCosts) {
          if (item.id) {
            await model.NonpersonnelCost.update(item, {
              where: { id: item.id },
              transaction,
            });
          } else {
            item.financialPlanId = financialPlanData.id;
            const result = await model.NonpersonnelCost.create(item, {
              transaction,
            });
            item.id = result.id;
          }
        }

        await syncDataHasMany(
          {
            currentModel: model.NonpersonnelCost,
            where: { financialPlanId: financialPlanData.id },
            data: financialPlanData.nonpersonnelCosts,
          },
          transaction
        );
      }
    }

    return "Update successful";
  });
};

const updateTraining = async (id, data) => {
  data = validate(updateInquiryTrainingValidation, data);

  const inquiry = await getInquiry(id);
  const inquiryTraining = inquiry.inquiryTraining;

  return await model.sequelize.transaction(async (transaction) => {
    for (const training of data.trainings) {
      if (training.id) {
        await model.Training.update(training, {
          where: { id: training.id },
          transaction,
        });

        // Update training classes if provided
        if (training.trainingClasses && training.trainingClasses.length > 0) {
          for (const trainingClass of training.trainingClasses) {
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
              data: training.trainingClasses,
            },
            transaction
          );
        }
      } else {
        training.inquiryTrainingId = inquiryTraining.id;
        const { runningNumber, code } = await generateTrainingCode(transaction);

        training.code = code;
        training.runningNumber = runningNumber;
        training.courseType = "In-House Training";
        const trainingCreated = await model.Training.create(training, {
          transaction,
        });

        // Create training classes if provided
        if (training.trainingClasses && training.trainingClasses.length > 0) {
          for (const trainingClass of training.trainingClasses) {
            trainingClass.trainingId = trainingCreated.id;
            await model.TrainingClass.create(trainingClass, { transaction });
          }
        }

        training.id = trainingCreated.id;
      }
    }

    await syncDataHasMany(
      {
        currentModel: model.Training,
        where: { inquiryTrainingId: inquiryTraining.id },
        data: data.trainings,
      },
      transaction
    );

    if (data.investmentFees) {
      const investmentFeesData = data.investmentFees;
      if (investmentFeesData.id) {
        await model.TrainInvestmentFees.update(investmentFeesData, {
          where: { id: investmentFeesData.id },
          transaction,
        });
      } else {
        await model.TrainInvestmentFees.destroy({
          where: { inquiryTrainingId: inquiryTraining.id },
          transaction,
        });

        investmentFeesData.inquiryTrainingId = inquiryTraining.id;
        await model.TrainInvestmentFees.create(investmentFeesData, {
          transaction,
        });
      }
    }

    if (data.appendix) {
      const appendixData = data.appendix;
      if (appendixData.id) {
        await model.TrainAppendix.update(appendixData, {
          where: { id: appendixData.id },
          transaction,
        });
      } else {
        await model.TrainAppendix.destroy({
          where: { inquiryTrainingId: inquiryTraining.id },
          transaction,
        });

        appendixData.inquiryTrainingId = inquiryTraining.id;
        await model.TrainAppendix.create(appendixData, {
          transaction,
        });
      }
    }

    if (data.financialPlans) {
      for (const financialPlanData of data.financialPlans) {
        if (!financialPlanData.id) {
          financialPlanData.inquiryTrainingId = inquiryTraining.id;
          const trainFinancialPlan = await model.TrainFinancialPlan.create(
            financialPlanData,
            { transaction }
          );

          financialPlanData.id = trainFinancialPlan.id;
        }

        if (financialPlanData.incentives) {
          for (const item of financialPlanData.incentives) {
            if (item.id) {
              await model.Incentive.update(item, {
                where: { id: item.id },
                transaction,
              });
            } else {
              item.financialPlanId = financialPlanData.id;
              const result = await model.Incentive.create(item, {
                transaction,
              });
              item.id = result.id;
            }
          }

          await syncDataHasMany(
            {
              currentModel: model.Incentive,
              where: { financialPlanId: financialPlanData.id },
              data: financialPlanData.incentives,
            },
            transaction
          );
        }

        if (financialPlanData.personnelCosts) {
          for (const item of financialPlanData.personnelCosts) {
            if (item.id) {
              await model.PersonnelCost.update(item, {
                where: { id: item.id },
                transaction,
              });
            } else {
              item.financialPlanId = financialPlanData.id;
              const result = await model.PersonnelCost.create(item, {
                transaction,
              });
              item.id = result.id;
            }
          }

          await syncDataHasMany(
            {
              currentModel: model.PersonnelCost,
              where: { financialPlanId: financialPlanData.id },
              data: financialPlanData.personnelCosts,
            },
            transaction
          );
        }

        if (financialPlanData.nonpersonnelCosts) {
          for (const item of financialPlanData.nonpersonnelCosts) {
            if (item.id) {
              await model.NonpersonnelCost.update(item, {
                where: { id: item.id },
                transaction,
              });
            } else {
              item.financialPlanId = financialPlanData.id;
              const result = await model.NonpersonnelCost.create(item, {
                transaction,
              });
              item.id = result.id;
            }
          }

          await syncDataHasMany(
            {
              currentModel: model.NonpersonnelCost,
              where: { financialPlanId: financialPlanData.id },
              data: financialPlanData.nonpersonnelCosts,
            },
            transaction
          );
        }
      }

      await syncDataHasMany(
        {
          currentModel: model.TrainFinancialPlan,
          where: { inquiryTrainingId: inquiryTraining.id },
          data: data.financialPlans,
        },
        transaction
      );
    }

    return "Update successful";
  });
};

const destroy = async (id) => {
  await getData(id);
  return await model.sequelize.transaction(async (transaction) => {
    await model.Inquiry.destroy({ where: { id }, transaction });
  });
};

const destroyMany = async (data) => {
  data = validate(deleteInquiryManyValidation, data);
  return await model.Inquiry.destroy({
    where: {
      id: {
        [Op.in]: data.ids,
      },
    },
  });
};

const generateProposal = async (id, userId) => {
  const inquiry = await getData(id);
  const isExistingProposal = await model.Proposal.findOne({
    where: { inquiryId: inquiry.id },
  });

  if (isExistingProposal) {
    throw new ResponseError(400, "Proposal already exists");
  }

  const { code, runningNumber, version, year } = await generateProposalCode({
    type: "CREATE",
    proposal: {},
  });

  return await model.Proposal.create({
    leadId: inquiry.leadId,
    inquiryId: inquiry.id,
    issuedById: userId,
    code,
    runningNumber,
    version,
    year,
    status: PROPOSAL_STATUS.DRAFT,
  });
};

module.exports = {
  getAll,
  create,
  getOne,
  updateConsultancy,
  updateTraining,
  destroy,
  destroyMany,
  generateProposal,
  getInquiry,
};
