'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pagos', {
      id_pago: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_pedido: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'carritos', key: 'id_carrito' },
        onDelete: 'CASCADE',
      },
      metodo: {
        type: Sequelize.ENUM('E', 'T'),
        allowNull: false
      },
      monto: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      estado: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('pagos');
  }
};
