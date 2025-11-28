const { Op } = require("sequelize");
const model = require("../../models/index");
const modelMasterdata = require("../../models/masterdata/index");
const modelAdministrative = require("../../models/administrative/index");
const validate = require("../../validations/validation");
const { ResponseError } = require("../../errors/response-error");
const {
  generateWorkorderCode,
  getStandardsFromProject,
  createHistory,
  getUser,
  searchData,
  pagination,
} = require("../../helpers/func");
const { SERVICES, WORKORDER_STATUS } = require("../../enum/utils");
const {
  generateWorkorderValidation,
  generateWorkorderManyValidation,
  setCompensationValidation,
  updateStatusWorkorderValidation,
  sendWorkorderValidation,
} = require("../../validations/sales/project-validation");
const { getProject } = require("./project-service");
const { transporter } = require("../../applications/email");

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

const getWorkOrder = async (id) => {
  const workorder = await model.WorkOrder.findOne({
    where: { id },
  });

  if (!workorder) {
    throw new ResponseError(404, "WorkOrder not found");
  }

  const issuer = await getUser(workorder.issuerId);
  const user = await getUser(workorder.issuerId);
  workorder.issuer = issuer;
  workorder.user = user;

  return workorder;
};

const getAll = async (data) => {
  const {
    page,
    limit,
    offset,
    orderby,
    sortBy,
    search,
    userId,
    projectId,
    status,
  } = data;
  const fieldSearch = searchData(["code"], search);

  const result = await model.WorkOrder.findAndCountAll({
    where: {
      ...fieldSearch,
      ...(userId ? { userId } : {}),
      ...(projectId ? { projectId } : {}),
      ...(status ? { status } : {}),
    },
    limit,
    offset,
    order: [[sortBy, orderby]],
  });

  result.rows = await Promise.all(
    result.rows.map(async (workorder) => {
      let plainWorkorder = workorder.get({ plain: true });
      const user = await getUser(plainWorkorder.userId);
      const issuer = await getUser(plainWorkorder.issuerId);

      plainWorkorder.user = user;
      plainWorkorder.issuer = issuer;
      return plainWorkorder;
    })
  );

  return pagination(result, page, limit);
};

const getOne = async (id) => {
  return await getWorkOrder(id);
};

const generateWorkOrder = async (data) => {
  data = validate(generateWorkorderValidation, data);
  const project = await getProject(data.projectId);
  if (project?.service?.name !== SERVICES.CONSULTANCY) {
    throw new ResponseError(400, "Project is not a consultancy service");
  }

  const teamroster = await model.TeamRoster.findOne({
    where: { projectId: project.id, consultantId: data.userId },
  });

  if (!teamroster) {
    throw new ResponseError(
      404,
      "Consultant is not assigned to the project team roster"
    );
  }

  // Check if work order already exists for this consultant in this project
  const existingWorkOrder = await model.WorkOrder.findOne({
    where: { projectId: project.id, userId: data.userId },
  });

  if (existingWorkOrder) {
    throw new ResponseError(
      400,
      "Work order already exists for this consultant in this project"
    );
  }

  // Generate work order code
  const { code, runningNumber, version } = await generateWorkorderCode();
  const deliverables = (project?.consultancy?.deliverables || []).filter(
    (del) => {
      const consultants = del.consultants || [];
      return consultants.some((c) => c.userId === data.userId);
    }
  );

  data.code = code;
  data.runningNumber = runningNumber;
  data.version = version;
  data.issueDate = new Date();
  data.serviceId = project.serviceId;
  data.standards = await getStandardsFromProject(project);
  data.role = teamroster.role;
  data.duration = deliverables.reduce(
    (sum, del) => sum + (parseFloat(del.estimateDuration) || 0),
    0
  );
  data.taskMilestones = getTaskMilestones(teamroster.role);
  data.status = WORKORDER_STATUS.DRAFT;

  return await model.WorkOrder.create(data);
};

const generateWorkOrderMany = async (data) => {
  data = validate(generateWorkorderManyValidation, data);
  const project = await getProject(data.projectId);

  data.issueDate = new Date();
  data.serviceId = project.serviceId;
  data.standards = await getStandardsFromProject(project);
  data.status = WORKORDER_STATUS.DRAFT;

  return await model.sequelize.transaction(async (transaction) => {
    for (const teamroster of project.teamRosters) {
      // Check if work order already exists for this consultant in this project
      const existingWorkOrder = await model.WorkOrder.findOne({
        where: { projectId: project.id, userId: teamroster.consultantId },
        transaction,
      });

      // Skip if work order already exists
      if (existingWorkOrder) {
        continue;
      }

      const deliverables = (project?.consultancy?.deliverables || []).filter(
        (del) => {
          const consultants = del.consultants || [];
          return consultants.some((c) => c.userId === teamroster.consultantId);
        }
      );

      const duration = deliverables.reduce(
        (sum, del) => sum + (parseFloat(del.estimateDuration) || 0),
        0
      );

      if (duration <= 0) {
        continue;
      }

      // Generate work order code
      const { code, runningNumber, version } = await generateWorkorderCode(
        "CREATE",
        null,
        transaction
      );

      data.code = code;
      data.runningNumber = runningNumber;
      data.version = version;
      data.duration = duration;
      data.role = teamroster.role;
      data.userId = teamroster.consultantId;
      data.taskMilestones = getTaskMilestones(teamroster.role);
      const workorderData = {
        ...data,
        userId: teamroster.consultantId,
      };

      await model.WorkOrder.create(workorderData, { transaction });
    }
  });
};

const setCompensation = async (id, data) => {
  data = validate(setCompensationValidation, data);
  const workorder = await getWorkOrder(id);

  return await workorder.update(data);
};

const updateStatus = async (id, data) => {
  data = validate(updateStatusWorkorderValidation, data);
  const workorder = await getWorkOrder(id);

  return await workorder.update(data);
};

const sendWorkOrder = async (id) => {
  const { FE_URL, CURRENT_EMAIL } = process.env;
  const workorder = await getWorkOrder(id);
  const project = await getProject(workorder.projectId);

  if (workorder.status === WORKORDER_STATUS.PENDING) {
    throw new ResponseError(400, "Work order already sent to consultant");
  }

  if (workorder.status === WORKORDER_STATUS.ACCEPTED) {
    throw new ResponseError(400, "Work order already accepted");
  }

  if (workorder.status === WORKORDER_STATUS.REJECTED) {
    throw new ResponseError(400, "Work order already rejected");
  }

  // Get consultant user details
  const consultant = await modelAdministrative.User.findOne({
    where: { id: workorder.userId },
    include: [
      {
        model: modelAdministrative.UserDetail,
        as: "userDetail",
        attributes: ["fullname"],
      },
    ],
  });

  if (!consultant) {
    throw new ResponseError(404, "Consultant not found");
  }

  // Update work order status to Pending and add history
  await model.sequelize.transaction(async (transaction) => {
    const newHistories = createHistory(
      workorder.acceptanceLogs,
      "WORK ORDER SENT",
      {
        workorderCode: workorder.code,
        status: WORKORDER_STATUS.PENDING,
      }
    );

    await workorder.update(
      {
        status: WORKORDER_STATUS.PENDING,
        acceptanceLogs: newHistories,
      },
      { transaction }
    );
  });

  // Prepare email options
  const mailOptions = {
    from: CURRENT_EMAIL ?? "sample@axia.com",
    to: consultant.email,
    subject: `Work Order: ${workorder.code}`,
    template: "emailworkorder",
    context: {
      user_name: consultant?.userDetail?.fullname || consultant.email,
      service: project.service.name,
      workorder_code: workorder.code,
      issueDate: new Date(workorder.issueDate).toLocaleDateString(),
      issuer: workorder.issuer?.userDetail?.fullname || "",
    },
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    return "Work order sent successfully";
  } catch (emailError) {
    throw new ResponseError(500, `Failed to send email: ${emailError.message}`);
  }
};

module.exports = {
  getAll,
  getOne,
  generateWorkOrder,
  generateWorkOrderMany,
  setCompensation,
  updateStatus,
  sendWorkOrder,
};
