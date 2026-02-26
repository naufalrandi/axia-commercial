'use strict';
const leads = require("../data/leads.json");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const formated = leads.map((lead) => ({
      id: lead.id,
      legalEntityTypeId: lead.legal_entity_type_id,
      code: lead.code,
      runningNumber: lead.running_number,
      name: lead.organization_name,
      website: lead.website,
      taxNumber: lead.taxpayer_identification_number,
      createdAt: now,
      updatedAt: now
    }));

    await queryInterface.bulkInsert("Leads", formated);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Leads", null, {});
  }
};
