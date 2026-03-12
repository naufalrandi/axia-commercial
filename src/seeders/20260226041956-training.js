'use strict';
const { v4: uuidv4 } = require("uuid");
const trainings = require("../data/training.json");
const { PROJECT_STATUS } = require("../enum/utils");
const { generateProjectCode, getTrainingCourseByWhere } = require("../helpers/func");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    for (const item of trainings) {
      const trainingId = uuidv4();
      const trainingCourse = await getTrainingCourseByWhere({ code: item.trainingCourseCode });
      // console.log(trainingCourse);
      // throw new Error("stop");
      

      // =========================
      // INSERT TRAINING
      // =========================
      await queryInterface.bulkInsert("Trainings", [{
        id: trainingId,
        trainingCourseId: trainingCourse?.id || null,
        inquiryTrainingId: null,
        runningNumber: item.runningNumber,
        code: item.code,
        courseType: item.courseType,
        issuer: item.issuer,
        courseMaterialFormat: item.courseMaterialFormat,
        certificateFormat: item.certificateFormat,
        createdAt: now,
        updatedAt: now
      }]);

      // =========================
      // INSERT PROJECT
      // =========================
      const {code, runningNumber} = await generateProjectCode();
      await queryInterface.bulkInsert("Projects", [{
        id: uuidv4(),
        code: code,
        runningNumber: runningNumber,
        leadId: item.leadId,
        serviceId: item.serviceId,
        trainingId: trainingId,
        status: PROJECT_STATUS.COMPLETED,
        createdAt: now,
        updatedAt: now
      }]);

      // =========================
      // INSERT TRAINING CLASSES
      // =========================
      for (const cls of item.trainingClasses) {

        await queryInterface.bulkInsert("TrainingClasses", [{
          trainingId: trainingId,
          class: cls.class,
          deliveryMethod: cls.deliveryMethod,
          startDate: cls.startDate,
          endDate: cls.endDate,
          createdAt: now,
          updatedAt: now
        }]);

        // =========================
        // INSERT CERTIFICATES (per class)
        // =========================
        const certificates = item.trainingCertificates.filter(
          cert => cert.class === cls.class
        );

        const formattedCertificates = certificates.map(cert => ({
          id: uuidv4(),
          trainingId: trainingId,
          trainingClassId: cls.class, // karena model pakai INTEGER
          certificateId: cert.certificateId,
          createdById: null,
          runningNumber: cert.runningNumber,
          code: cert.code,
          fullname: cert.fullname,
          email: cert.email,
          active: true,
          createdAt: now,
          updatedAt: now
        }));

        if (formattedCertificates.length > 0) {
          await queryInterface.bulkInsert(
            "TrainingCertificates",
            formattedCertificates
          );
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("TrainingCertificates", null, {});
    await queryInterface.bulkDelete("TrainingClasses", null, {});
    await queryInterface.bulkDelete("Trainings", null, {});
  }
};
