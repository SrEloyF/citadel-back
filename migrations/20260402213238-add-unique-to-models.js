'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('dulzores', {
      fields: ['nombre'],
      type: 'unique',
      name: 'unique_dulzores_nombre'
    });

    await queryInterface.addConstraint('sabores', {
      fields: ['nombre'],
      type: 'unique',
      name: 'unique_sabores_nombre'
    });

    await queryInterface.addConstraint('presentaciones', {
      fields: ['volumen_ml', 'botellas_por_caja'],
      type: 'unique',
      name: 'unique_volumen_botellas'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('dulzores', 'unique_dulzores_nombre');
    await queryInterface.removeConstraint('sabores', 'unique_sabores_nombre');
    await queryInterface.removeConstraint('presentaciones', 'unique_volumen_botellas');
  }
};