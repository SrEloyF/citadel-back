'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('precios', {
      id_precio: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_vino: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'vinos',
          key: 'id_vino'
        },
      },
      tipo_venta: {
        type: Sequelize.ENUM('my', 'mn'),
        allowNull: false
      }
      ,
      cantidad_minima: {
        type: Sequelize.INTEGER
      },
      precio: {
        type: Sequelize.DOUBLE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('precios');
  }
};