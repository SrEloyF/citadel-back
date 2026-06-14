'use strict';

const { safeAddIndex, safeRemoveIndex } = require('../utils/safe-update-column');

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_carritos_estado" ADD VALUE IF NOT EXISTS 'R';
      `);

      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_carritos_estado" ADD VALUE IF NOT EXISTS 'P';
      `);

      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_carritos_estado" ADD VALUE IF NOT EXISTS 'A';
      `);

      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_carritos_estado" ADD VALUE IF NOT EXISTS 'S';
      `);

      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_carritos_estado" ADD VALUE IF NOT EXISTS 'C';
      `);
    } else {
      await queryInterface.changeColumn('carritos', 'estado', {
        type: Sequelize.ENUM(
          'E',
          'P',
          'R',
          'A',
          'S',
          'C'
        ),
        allowNull: false,
        defaultValue: 'E'
      });
    }

    await queryInterface.createTable('pedido_estados_historial', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_carrito: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'carritos',
          key: 'id_carrito'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      estado: {
        type: Sequelize.ENUM(
          'E',
          'P',
          'R',
          'A',
          'S',
          'C'
        ),
        allowNull: false
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await safeAddIndex(
      queryInterface,
      'pedido_estados_historial',
      ['id_carrito'],
      {
        name: 'idx_pedido_estados_historial_carrito'
      }
    );
  },

  async down(queryInterface) {
    await safeRemoveIndex(
      queryInterface,
      'pedido_estados_historial',
      'idx_pedido_estados_historial_carrito'
    );

    await queryInterface.dropTable('pedido_estados_historial');

    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_pedido_estados_historial_estado";
      `);
    }
  }
};