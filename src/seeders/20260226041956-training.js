'use strict';
const { v4: uuidv4 } = require("uuid");
const trainings = require("../data/training.json");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    for (const item of trainings) {
      const trainingId = uuidv4();

      // =========================
      // INSERT TRAINING
      // =========================
      await queryInterface.bulkInsert("Trainings", [{
        id: trainingId,
        trainingCourseId: item.trainingCourseId,
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
      await queryInterface.bulkInsert("Projects", [{
        id: uuidv4(),
        leadId: item.leadId,
        serviceId: item.serviceId,
        trainingId: trainingId,
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
