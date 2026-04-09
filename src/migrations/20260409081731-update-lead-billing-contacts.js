'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hapus field addressId
    await queryInterface.removeColumn('LeadBillingContacts', 'addressId');
     await queryInterface.addColumn('LeadBillingContacts', 'designation', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'id', // opsional: sesuaikan posisi field jika diperlukan
    });
  },
 
  async down(queryInterface, Sequelize) {
    // Rollback: hapus field designation
    await queryInterface.removeColumn('LeadBillingContacts', 'designation');
 
    // Rollback: kembalikan field addressId
    await queryInterface.addColumn('LeadBillingContacts', 'addressId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
