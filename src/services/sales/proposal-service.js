const { Op } = require("sequelize");
const model = require("../../models/index");
const modelAdministrative = require("../../models/administrative/index");
const validate = require("../../validations/validation");
const { ResponseError } = require("../../errors/response-error");
const {
  searchData,
  pagination,
  generateProposalCode,
  getOTPVerification,
  verifyVerification,
  encryptData,
  generateProjectCode,
  generateInvoiceCode,
  getBankAccountByPurpose,
  getPrimaryLocation,
  sentInvoiceEmail,
} = require("../../helpers/func");
const {
  updateInvestmentFeesValidation,
  setBillingContactValidation,
  sentEmailValidation,
  updateStatusValidation,
} = require("../../validations/sales/proposal-validation");
const {
  SERVICES,
  PROPOSAL_STATUS,
  PROJECT_STATUS,
  PAYMENT_CONDITIONS,
} = require("../../enum/utils");
const { getInquiry } = require("./inquiry-service");
const { transporter } = require("../../applications/email");
const { getLead } = require("./lead-service");
const moment = require("moment");

const createHistory = (currentHistories, label, additionalData = {}) => {
  const newHistoryEntry = {
    id: Date.now(),
    label: label,
    timestamp: new Date().toISOString(),
    details: additionalData,
  };

  let histories = [];
  if (currentHistories) {
    if (Array.isArray(currentHistories)) {
      histories = currentHistories;
    } else if (typeof currentHistories === "string") {
      try {
        const parsed = JSON.parse(currentHistories);
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

async function getProposal(id, withHistories = true) {
  let result = await model.Proposal.findOne({
    where: { id },
    ...(withHistories ? {} : { attributes: { exclude: ["histories"] } }),
    include: [
      {
        model: model.Lead,
        as: "lead",
        attributes: ["id", "code", "name"],
      },
      {
        model: model.LeadBillingContact,
        as: "billingContact",
        attributes: ["id", "fullname", "email", "phoneNumber"],
      },
      {
        model: model.LeadContact,
        as: "leadContact",
        attributes: ["id", "fullname", "email", "phoneNumber"],
      },
    ],
  });

  if (!result) throw new ResponseError(404, "Proposal not found");
  result = result.toJSON();
  let histories = [];
  if (result.histories) {
    try {
      histories =
        typeof result.histories === "string"
          ? JSON.parse(result.histories)
          : Array.isArray(result.histories)
          ? result.histories
          : [];
    } catch (error) {
      histories = [];
    }
  }

  result.histories = histories.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  if (result.inquiryId) {
    const inquiry = await getInquiry(result.inquiryId);
    result.inquiry = inquiry;
  }

  return result;
}

const generateProject = async (proposal, transaction) => {
  const service = proposal.inquiry.service;
  switch (service.name) {
    case SERVICES.CONSULTANCY:
      const consultancy = proposal.inquiry.consultancy;
      const deliverables = proposal.inquiry?.consultancy?.deliverables || [];
      const { code, runningNumber } = await generateProjectCode(transaction);

      // Create project
      const project = await model.Project.create(
        {
          code,
          runningNumber,
          consultancyId: consultancy.id,
          proposalId: proposal.id,
          serviceId: service.id,
          leadId: proposal.leadId,
          status: PROJECT_STATUS.PENDING,
        },
        { transaction }
      );

      // Create milestones from deliverables
      if (deliverables && deliverables.length > 0) {
        const milestones = deliverables.map((deliverable) => ({
          projectId: project.id,
          deliverableId: deliverable.id,
          status: "Pending",
          isKickoff: false,
          isClossing: false,
        }));

        milestones.push({
          projectId: project.id,
          status: "Pending",
          isKickoff: true,
          isClossing: false,
        });

        milestones.push({
          projectId: project.id,
          status: "Pending",
          isKickoff: false,
          isClossing: true,
        });

        await model.Milestone.bulkCreate(milestones, { transaction });
      }

      break;
    case SERVICES.TRAINING:
      const trainings = proposal.inquiry?.inquiryTraining?.trainings || [];
      for (const training of trainings) {
        const { code, runningNumber } = await generateProjectCode(transaction);
        await model.Project.create(
          {
            code,
            runningNumber,
            inquiryTrainingId: proposal.inquiry.inquiryTraining.id,
            trainingId: training.id,
            proposalId: proposal.id,
            serviceId: service.id,
            leadId: proposal.leadId,
            status: PROJECT_STATUS.PENDING,
          },
          { transaction }
        );
      }

      break;
    default:
      throw new ResponseError(400, "Invalid service type");
  }

  // generate invoice
  await generateInvoice(proposal, transaction);
};

const generateInvoice = async (proposal, transaction) => {
  let paymentTerms = [];
  let invoices = [];

  if (proposal.inquiry.service.name === SERVICES.CONSULTANCY) {
    paymentTerms = proposal.inquiry.consultancy.appendix.paymentTerms || [];
    const investmentFees = proposal.inquiry?.consultancy?.investmentFees;

    for (const paymentTerm of paymentTerms) {
      const { code, runningNumber } = await generateInvoiceCode(transaction);
      const bankAccount = await getBankAccountByPurpose("Invoice Payment");
      const location = await getPrimaryLocation();
      const client = await getLead(proposal.leadId);

      const data = {
        code,
        runningNumber,
        proposalNumber: proposal.code,
        issueDate: moment().format("YYYY-MM-DD"),
        paymentTerm: paymentTerm,
        client: client,
        billTo: client,
        investmentFees: investmentFees.get({ plain: true }),
        bankAccount: bankAccount.get({ plain: true }),
        location: location.get({ plain: true }),
      };

      const invoice = await modelAdministrative.Invoice.create(data);
      await model.LeadInvoice.create(
        {
          leadId: proposal.leadId,
          invoiceId: invoice.id,
        },
        { transaction }
      );

      invoices.push(invoice.get({ plain: true }));
    }
  } else if (proposal.inquiry.service.name === SERVICES.TRAINING) {
    paymentTerms = proposal.inquiry.inquiryTraining.appendix.paymentTerms || [];
    const investmentFees = proposal.inquiry?.inquiryTraining?.investmentFees;

    for (const paymentTerm of paymentTerms) {
      const { code, runningNumber } = await generateInvoiceCode(transaction);
      const bankAccount = await getBankAccountByPurpose("Invoice Payment");
      const location = await getPrimaryLocation();
      const client = await getLead(proposal.leadId);
      const dueDate = moment(paymentTerm.dueDate)
        .add(paymentTerm.days, "day")
        .format("YYYY-MM-DD");

      const data = {
        code,
        runningNumber,
        proposalNumber: proposal.code,
        issueDate: moment().format("YYYY-MM-DD"),
        dueDate: dueDate,
        paymentTerm: paymentTerm,
        client: client,
        billTo: client,
        investmentFees: investmentFees.get({ plain: true }),
        bankAccount: bankAccount.get({ plain: true }),
        location: location.get({ plain: true }),
      };

      const invoice = await modelAdministrative.Invoice.create(data);
      await model.LeadInvoice.create(
        {
          leadId: proposal.leadId,
          invoiceId: invoice.id,
        },
        { transaction }
      );

      invoices.push(invoice.get({ plain: true }));
    }
  }

  const afterAcceptedInvoices = invoices.filter(
    (i) =>
      i?.paymentTerm?.paymentCondition?.triger ===
      PAYMENT_CONDITIONS.AFTER_ACCEPTED_PROPOSAL
  );

  for (const invoice of afterAcceptedInvoices) {
    await sentInvoiceEmail(invoice, proposal.billingContact);
  }
};

const getAll = async (data) => {
  const { page, limit, offset, orderby, sortBy, search, leadId } = data;
  const fieldSearch = searchData(["code"], search);

  const result = await model.Proposal.findAndCountAll({
    where: {
      ...fieldSearch,
      ...(leadId ? { leadId: leadId } : {}),
    },
    attributes: {
      exclude: ["histories", "remarks", "metaData"],
    },
    include: [],
    limit,
    offset,
    order: [[sortBy, orderby]],
  });

  return pagination(result, page, limit);
};

const getOne = async (id) => {
  return await getProposal(id);
};

const setBillingContact = async (id, data) => {
  data = validate(setBillingContactValidation, data);

  await getProposal(id);
  const billingContact = await model.LeadBillingContact.findOne({
    where: { id: data.billingContactId },
  });

  if (!billingContact) {
    throw new ResponseError(404, "Billing contact not found");
  }

  await model.Proposal.update(data, { where: { id } });
  return "Billing contact updated successfully";
};

const updateInvestmentFees = async (id, data) => {
  data = validate(updateInvestmentFeesValidation, data);

  const proposal = await getProposal(id);
  const inquiry = await getInquiry(proposal.inquiryId);
  let investmentFees = null;

  switch (inquiry.service.name) {
    case SERVICES.CONSULTANCY:
      investmentFees = inquiry.consultancy.investmentFees;
      break;
    case SERVICES.TRAINING:
      investmentFees = inquiry.inquiryTraining.investmentFees;
      break;
    default:
      throw new ResponseError(400, "Invalid service type");
  }

  if (!investmentFees) {
    throw new ResponseError(400, "Investment fees not found");
  }

  return await model.sequelize.transaction(async (transaction) => {
    const { runningNumber, code, version, year } = await generateProposalCode(
      {
        type: "REVISE",
        proposal,
      },
      transaction
    );

    const { histories: _, ...proposalWithoutHistories } = proposal;
    const histories = createHistory(
      proposal.histories,
      "UPDATED INVESTMENT FEES",
      {
        proposalCode: proposal.code,
        change: proposalWithoutHistories,
      }
    );

    await model.Proposal.update(
      {
        runningNumber,
        code,
        version,
        year,
        histories,
      },
      {
        where: { id: proposal.id },
        transaction,
      }
    );

    await model.TrainInvestmentFees.update(data, {
      where: { id: investmentFees.id },
      transaction,
    });

    return "Investment fees updated successfully";
  });
};

const destroy = async (id) => {
  await getProposal(id);
  return await model.Proposal.destroy({ where: { id } });
};

const destroyMany = async (data) => {
  data = validate(destroyManyValidation, data);
  return await model.Proposal.destroy({
    where: {
      id: {
        [Op.in]: data.ids,
      },
    },
  });
};

const sendEmail = async (id, data) => {
  data = validate(sentEmailValidation, data);
  const { FE_URL, CURRENT_EMAIL } = process.env;
  const proposal = await getProposal(id);

  if (proposal.status === PROPOSAL_STATUS.SENT) {
    throw new ResponseError(400, "Proposal already sent to personnel");
  }

  if (proposal.status === PROPOSAL_STATUS.ACCEPTED) {
    throw new ResponseError(400, "Proposal already accepted");
  }

  if (!proposal.billingContactId) {
    throw new ResponseError(400, "Proposal does not have billing contact");
  }

  const leadContact = await model.LeadContact.findOne({
    where: { id: data.leadContactId },
  });

  if (!leadContact) {
    throw new ResponseError(404, "Lead contact not found");
  }

  const { histories: _, ...proposalWithoutHistories } = proposal;
  await model.sequelize.transaction(async (transaction) => {
    const newHistories = createHistory(
      proposal.histories,
      "SENT PROPOSAL EMAIL",
      {
        proposalCode: proposal.code,
        change: proposalWithoutHistories,
      }
    );

    await model.Proposal.update(
      {
        ...data,
        histories: newHistories,
        status: PROPOSAL_STATUS.SENT,
        sendedAt: new Date(),
      },
      {
        where: {
          id: proposal.id,
        },
        transaction,
      }
    );
  });

  // Prepare email options
  const mailOptions = {
    from: CURRENT_EMAIL ?? "sample@axia.com",
    to: leadContact.email,
    subject: `Confidential: ${proposal.code} for ${proposal.lead.name}`,
    template: "emailcontract",
    context: {
      user_name: proposal?.leadContact?.fullname,
      link: `${FE_URL ?? "http://localhost:5011"}/proposals/${proposal?.id}`,
    },
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    return "Email sent successfully";
  } catch (emailError) {
    throw new ResponseError(500, `Failed to send email: ${emailError.message}`);
  }
};

const resendEmail = async (id, data) => {
  data = validate(sentEmailValidation, data);
  const { FE_URL, CURRENT_EMAIL } = process.env;
  const proposal = await getProposal(id);

  if (proposal.status !== PROPOSAL_STATUS.SENT) {
    throw new ResponseError(400, "Proposal not sent to personnel");
  }

  if (!proposal.billingContactId) {
    throw new ResponseError(400, "Proposal does not have billing contact");
  }

  const leadContact = await model.LeadContact.findOne({
    where: { id: data.leadContactId },
  });

  if (!leadContact) {
    throw new ResponseError(404, "Lead contact not found");
  }

  const { histories: _, ...proposalWithoutHistories } = proposal;
  await model.sequelize.transaction(async (transaction) => {
    const newHistories = createHistory(
      proposal.histories,
      "RESENT PROPOSAL EMAIL",
      {
        proposalCode: proposal.code,
        change: proposalWithoutHistories,
      }
    );

    await model.Proposal.update(
      {
        ...data,
        histories: newHistories,
        status: PROPOSAL_STATUS.SENT,
        sendedAt: new Date(),
      },
      {
        where: {
          id: proposal.id,
        },
        transaction,
      }
    );
  });

  // Prepare email options
  const mailOptions = {
    from: CURRENT_EMAIL ?? "sample@axia.com",
    to: leadContact.email,
    subject: `Confidential: ${proposal.code} for ${proposal.lead.name}`,
    template: "emailcontract",
    context: {
      user_name: proposal?.leadContact?.fullname,
      link: `${FE_URL ?? "http://localhost:5011"}/proposals/${proposal?.id}`,
    },
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    return "Email sent successfully";
  } catch (emailError) {
    throw new ResponseError(500, `Failed to send email: ${emailError.message}`);
  }
};

// API PUBLIC

const getOtp = async (id) => {
  const { CURRENT_EMAIL } = process.env;
  const proposal = await getProposal(id, false);

  if (proposal.status !== PROPOSAL_STATUS.SENT)
    throw new ResponseError(400, "Proposal not sent to personnel");

  if (!proposal.leadContact)
    throw new ResponseError(400, "Proposal has no lead contact");

  if (proposal?.verifiedAt)
    throw new ResponseError(400, "proposal already verified");

  const otp = await getOTPVerification({
    proposal_id: proposal.id,
  });

  const mailOptions = {
    from: CURRENT_EMAIL || "sample@axia.com",
    to: proposal?.leadContact?.email,
    subject: `OTP for ${proposal.code}`,
    template: "otp",
    context: {
      fullname: proposal?.leadContact?.fullname,
      otp: otp,
      type: "Proposal Verification",
    },
  };

  try {
    await transporter.sendMail(mailOptions);
    return "Email sent successfully";
  } catch (emailError) {
    throw new ResponseError(500, `Failed to send email: ${emailError.message}`);
  }
};

const verifyOtp = async (id, data) => {
  const proposal = await getProposal(id);
  if (proposal.status !== PROPOSAL_STATUS.SENT)
    throw new ResponseError(400, "Proposal not sent to personnel");

  if (proposal?.verifiedAt)
    throw new ResponseError(400, "proposal already verified");

  const checkOtp = await verifyVerification(data.otp, {
    proposal_id: proposal.id,
  });

  if (!checkOtp) throw new Error("OTP is invalid");

  await model.Proposal.update(
    { verifiedAt: new Date() },
    { where: { id: proposal.id } }
  );

  return "Verified successfully";
};

const getOnePublic = async (id) => {
  const proposal = await getProposal(id);

  if (!proposal.verifiedAt)
    throw new ResponseError(400, "Proposal is not verified");

  return encryptData(proposal);
};

const updateStatus = async (id, data) => {
  data = validate(updateStatusValidation, data);
  const proposal = await getProposal(id);
  const histories = proposal.histories;
  delete proposal.histories;

  // if (!proposal.verifiedAt)
  //   throw new ResponseError(400, "proposal is not verified");

  // if (proposal.status === PROPOSAL_STATUS.ACCEPTED)
  //   throw new ResponseError(400, "Proposal has been accepted");

  // if (proposal.status !== PROPOSAL_STATUS.SENT)
  //   throw new ResponseError(400, "Cannot update status for this proposal");

  let title = "";
  const payload = {};
  await model.sequelize.transaction(async (transaction) => {
    switch (data.status) {
      case PROPOSAL_STATUS.ACCEPTED:
        title = "Proposal has been accepted";
        payload.status = PROPOSAL_STATUS.ACCEPTED;
        payload.remarks = null;
        payload.acceptedAt = new Date();

        // Generate project
        await generateProject(proposal, transaction);

        break;
      case PROPOSAL_STATUS.NEGOTIATED:
        title = "Proposal has been negotiated";
        payload.status = PROPOSAL_STATUS.NEGOTIATED;
        payload.remarks = data.remarks;
        break;
      case PROPOSAL_STATUS.REJECTED:
        title = "Proposal has been rejected";
        payload.status = PROPOSAL_STATUS.REJECTED;
        payload.remarks = data.remarks;
        payload.active = false;
        payload.rejectedAt = new Date();
        break;
      default:
        throw new ResponseError(400, "status is invalid");
    }

    payload.histories = createHistory(histories, title, {
      proposalCode: proposal.code,
      change: proposal,
    });

    await model.Proposal.update(payload, {
      where: { id },
      transaction,
    });
  });

  return "Status updated successfully";
};

module.exports = {
  getAll,
  getOne,
  setBillingContact,
  updateInvestmentFees,
  destroy,
  destroyMany,
  sendEmail,
  resendEmail,
  getOtp,
  verifyOtp,
  getOnePublic,
  updateStatus,
  getProposal,
};
