'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`
        CREATE TYPE tipo_reclamo_enum AS ENUM ('R', 'Q');
      `);

      await queryInterface.sequelize.query(`
        CREATE TYPE estado_reclamo_enum AS ENUM ('N', 'R', 'S');
      `);

      await queryInterface.sequelize.query(`
        CREATE TYPE tipo_descuento_enum AS ENUM ('F', 'P');
      `);
    }

    await queryInterface.createTable('cupones', {
      id_cupon: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
      },
      tipo_descuento: {
        type: dialect === 'postgres'
          ? 'tipo_descuento_enum'
          : Sequelize.ENUM('F', 'P'),
        allowNull: false
      },
      descuento: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      monto_minimo: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
      },
      fecha_inicio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fecha_fin: {
        type: Sequelize.DATE,
        allowNull: false
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.createTable('reclamos', {
      id_reclamo: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_pedido: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'carritos',
          key: 'id_carrito'
        },
        onDelete: 'SET NULL'
      },
      dni: {
        type: Sequelize.STRING(8)
      },
      nombres: {
        type: Sequelize.STRING(50)
      },
      apellidos: {
        type: Sequelize.STRING(50)
      },
      email: {
        type: Sequelize.STRING(50)
      },
      telefono: {
        type: Sequelize.STRING(50)
      },
      tipo: {
        type: dialect === 'postgres'
          ? 'tipo_reclamo_enum'
          : Sequelize.ENUM('R', 'Q'),
        allowNull: false
      },
      motivo: {
        type: Sequelize.TEXT
      },
      detalles: {
        type: Sequelize.TEXT
      },
      estado: {
        type: dialect === 'postgres'
          ? 'estado_reclamo_enum'
          : Sequelize.ENUM('N', 'R', 'S'),
        allowNull: false,
        defaultValue: 'N'
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addColumn('carritos', 'id_cupon', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'cupones',
        key: 'id_cupon'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    await queryInterface.removeColumn('carritos', 'id_cupon');

    await queryInterface.dropTable('reclamos');
    await queryInterface.dropTable('cupones');

    if (dialect === 'postgres') {
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS tipo_reclamo_enum;`);
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS estado_reclamo_enum;`);
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS tipo_descuento_enum;`);
    }
  }
};