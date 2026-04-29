'use strict';
const { safeRemoveColumn, safeAddColumn } = require('../utils/safe-update-column');
module.exports = {
  async up(queryInterface, Sequelize) {
    await safeAddColumn(queryInterface, 'usuarios', 'refresh_token', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'refresh_token');
  }
};
