'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('usuarios', 'hash_contrasena', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('usuarios', 'google_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'google_id');
    await queryInterface.changeColumn('usuarios', 'hash_contrasena', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};