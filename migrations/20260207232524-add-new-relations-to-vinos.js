'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vinos', 'id_sabor', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Sabores',
        key: 'id_sabor',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addColumn('vinos', 'id_presentacion', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'presentaciones',
        key: 'id_presentacion',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.removeColumn('vinos', 'id_categoria');
    await queryInterface.removeColumn('vinos', 'precio');

    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_vinos_estado" RENAME TO "enum_vinos_estado_old";
      `);
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_vinos_estado" AS ENUM('D', 'A', 'P');
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE "vinos" ALTER COLUMN "estado" TYPE "enum_vinos_estado" USING "estado"::text::enum_vinos_estado;
      `);
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_vinos_estado_old";
      `);
    } else if (queryInterface.sequelize.options.dialect === 'mysql') {
      await queryInterface.changeColumn('vinos', 'estado', {
        type: Sequelize.ENUM('D', 'A', 'P'),
        allowNull: false,
        defaultValue: 'D',
      });
    }

    await queryInterface.addConstraint('vinos', {
      fields: ['id_sabor', 'id_presentacion', 'volumen_ml'],
      type: 'unique',
      name: 'unique_sabor_presentacion_volumen'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('vinos', 'unique_sabor_presentacion_volumen');

    await queryInterface.removeColumn('vinos', 'id_sabor');
    await queryInterface.removeColumn('vinos', 'id_presentacion');
    await queryInterface.addColumn('vinos', 'id_categoria', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('vinos', 'precio', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    });

    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_vinos_estado" RENAME TO "enum_vinos_estado_new";
      `);
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_vinos_estado" AS ENUM('D', 'A');
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE "vinos" ALTER COLUMN "estado" TYPE "enum_vinos_estado" USING "estado"::text::enum_vinos_estado;
      `);
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_vinos_estado_new";
      `);
    } else if (queryInterface.sequelize.options.dialect === 'mysql') {
      await queryInterface.changeColumn('vinos', 'estado', {
        type: Sequelize.ENUM('D', 'A'),
        allowNull: false,
        defaultValue: 'D',
      });
    }
  },
};
