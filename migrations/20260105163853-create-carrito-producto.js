'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('carritos_productos', {
      id_carrito_producto: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_carrito: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'carritos', key: 'id_carrito' },
        onDelete: 'CASCADE'
      },
      id_vino: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'vinos', key: 'id_vino' },
        onDelete: 'RESTRICT'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      precio_venta: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('carritos_productos');
  }
};
