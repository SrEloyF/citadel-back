'use strict';
const { safeRemoveColumn, safeAddColumn } = require('../utils/safe-update-column');

module.exports = {
  async up(queryInterface, Sequelize) {
    await safeAddColumn(queryInterface, 'direcciones', 'activo', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  },

  async down(queryInterface, Sequelize) {
    await safeRemoveColumn(queryInterface, 'direcciones', 'activo');
  }
};