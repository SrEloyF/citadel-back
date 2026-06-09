'use strict';
const { safeRemoveColumn, safeAddColumn } = require('../utils/safe-update-column');

module.exports = {
  async up(queryInterface, Sequelize) {
    await safeAddColumn(queryInterface, 'carritos', 'tipo', {
      type: Sequelize.ENUM('D', 'T'),
      allowNull: false,
      defaultValue: 'D'
    });
  },

  async down(queryInterface, Sequelize) {
    await safeRemoveColumn(queryInterface, 'carritos', 'tipo');
  }
};