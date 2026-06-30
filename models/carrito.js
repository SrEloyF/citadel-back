'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Carrito extends Model {
    static associate(models) {
      this.belongsTo(models.Cupon, { foreignKey: 'id_cupon', as: 'cupon' });
      this.hasMany(models.CarritoProducto, { foreignKey: 'id_carrito' });
      this.hasOne(models.Pago, { foreignKey: 'id_pedido', as: 'pago' });
      this.hasMany(models.PedidoEstadoHistorial, { foreignKey: 'id_carrito', as: 'historialEstados' });
      this.belongsTo(models.Direccion, { foreignKey: 'id_direccion', as: 'direccion' });
    }
  }

  Carrito.init({
    id_carrito: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_direccion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_cupon: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM(
        'E', // En Espera
        'P', // Pagado
        'R', // Revisado
        'A', // Alistado
        'S', // Enviado o listo para recoger
        'C', // Completado
      ),
      allowNull: false,
      defaultValue: 'E'
    },
    fecha_pedido: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_compra: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    tipo: {
      type: DataTypes.ENUM('D', 'T'),
      allowNull: false,
      defaultValue: 'D'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Carrito',
    tableName: 'carritos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'updated_at',
    hooks: {
      afterCreate: async (carrito, options) => {
        const { PedidoEstadoHistorial } = sequelize.models;
        await PedidoEstadoHistorial.create({
          id_carrito: carrito.id_carrito,
          estado: carrito.estado,
          fecha: new Date()
        }, { transaction: options.transaction });
      },
      afterUpdate: async (carrito, options) => {
        if (carrito.changed('estado')) {
          const { PedidoEstadoHistorial } = sequelize.models;
          await PedidoEstadoHistorial.create({
            id_carrito: carrito.id_carrito,
            estado: carrito.estado,
            fecha: new Date()
          }, { transaction: options.transaction });
        }
      }
    }
  });

  return Carrito;
};
