'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('carritos', {
      id_carrito: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id_usuario' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      estado: {
        type: Sequelize.ENUM('E','V'),
        allowNull: false,
        defaultValue: 'E'
      },
      fecha_pedido: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fecha_compra: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fecha_creacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('carritos');
  }
};
