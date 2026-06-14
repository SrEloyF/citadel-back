'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PedidoEstadoHistorial extends Model {
    static associate(models) {
      this.belongsTo(models.Carrito, {
        foreignKey: 'id_carrito',
        as: 'carrito'
      });
    }
  }

  PedidoEstadoHistorial.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_carrito: {
      type: DataTypes.INTEGER,
      allowNull: false
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
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'PedidoEstadoHistorial',
    tableName: 'pedido_estados_historial',
    timestamps: false
  });

  return PedidoEstadoHistorial;
};