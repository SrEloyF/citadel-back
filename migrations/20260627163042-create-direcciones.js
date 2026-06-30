'use strict';
const { safeRemoveColumn, safeAddColumn } = require('../utils/safe-update-column');

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('direcciones', {
      id_direccion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id_usuario'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      id_departamento: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      id_provincia: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      id_distrito: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      calle: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      numero: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      cp: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      principal: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    });

    await safeAddColumn(queryInterface, 'carritos', 'id_direccion', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'direcciones',
        key: 'id_direccion'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await safeRemoveColumn(queryInterface, 'carritos', 'id_usuario');
    await safeRemoveColumn(queryInterface, 'usuarios', 'direccion');
    await safeRemoveColumn(queryInterface, 'usuarios', 'ciudad');
  },

  async down(queryInterface, Sequelize) {

    await safeAddColumn(queryInterface, 'usuarios', 'direccion', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await safeAddColumn(queryInterface, 'usuarios', 'ciudad', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await safeAddColumn(queryInterface, 'carritos', 'id_usuario', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await safeRemoveColumn(queryInterface, 'carritos', 'id_direccion');
    await queryInterface.dropTable('direcciones');
  }
};