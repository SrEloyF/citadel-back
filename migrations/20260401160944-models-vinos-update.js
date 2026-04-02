'use strict';
const { safeRemoveColumn, safeAddColumn } = require('../utils/safe-update-column');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dulzores', {
      id_dulzor: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });

    await safeRemoveColumn(queryInterface, 'carritos_productos', 'id_vino');

    await safeAddColumn(queryInterface, 'carritos_productos', 'id_precio', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'precios',
        key: 'id_precio'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await safeRemoveColumn(queryInterface, 'precios', 'tipo_venta');

    await safeRemoveColumn(queryInterface, 'presentaciones', 'nombre');

    await safeAddColumn(queryInterface, 'presentaciones', 'volumen_ml', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await safeAddColumn(queryInterface, 'presentaciones', 'botellas_por_caja', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await safeRemoveColumn(queryInterface, 'sabores', 'descripcion');

    await safeAddColumn(queryInterface, 'vinos', 'sku', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('vinos', 'descripcion', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn('vinos', 'url_img_principal', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await safeAddColumn(queryInterface, 'vinos', 'id_dulzor', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'dulzores',
        key: 'id_dulzor'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await safeRemoveColumn(queryInterface, 'vinos', 'volumen_ml');

    await queryInterface.addIndex('vinos', ['id_sabor']);
    await queryInterface.addIndex('vinos', ['id_presentacion']);

    await queryInterface.removeIndex('vinos', 'unique_sabor_presentacion_volumen');

    await queryInterface.addIndex('vinos', ['id_sabor', 'id_dulzor', 'id_presentacion'], {
      unique: true,
      name: 'unique_sabor_dulzor_presentacion'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('vinos', 'unique_sabor_dulzor_presentacion');

    await safeAddColumn(queryInterface, 'vinos', 'volumen_ml', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await safeRemoveColumn(queryInterface, 'vinos', 'sku');
    await safeRemoveColumn(queryInterface, 'vinos', 'id_dulzor');

    await queryInterface.changeColumn('vinos', 'descripcion', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('vinos', 'url_img_principal', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addIndex('vinos', ['id_sabor', 'id_presentacion', 'volumen_ml'], {
      unique: true,
      name: 'unique_sabor_presentacion_volumen'
    });

    await safeAddColumn(queryInterface, 'sabores', 'descripcion', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await safeRemoveColumn(queryInterface, 'presentaciones', 'volumen_ml');
    await safeRemoveColumn(queryInterface, 'presentaciones', 'botellas_por_caja');

    await safeAddColumn(queryInterface, 'presentaciones', 'nombre', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await safeAddColumn(queryInterface, 'precios', 'tipo_venta', {
      type: Sequelize.ENUM('my', 'mn'),
      allowNull: false,
    });

    await safeRemoveColumn(queryInterface, 'carritos_productos', 'id_precio');

    await safeAddColumn(queryInterface, 'carritos_productos', 'id_vino', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.dropTable('dulzores');
  }
};