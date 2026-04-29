'use strict';
const { safeRemoveColumn, safeAddColumn } = require('../utils/safe-update-column');
module.exports = {
  async up(queryInterface, Sequelize) {
    await safeRemoveColumn(queryInterface, 'vinos', 'updated_at');
  },

  async down(queryInterface, Sequelize) {
    await safeAddColumn(queryInterface, 'vinos', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  }
};
