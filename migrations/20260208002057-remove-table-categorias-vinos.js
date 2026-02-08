'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('categorias_vinos');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('categorias_vinos', {
      id_categoria: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('D','A'),
        allowNull: false,
        defaultValue: 'A'
      },
    });
  }
};
