'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reclamo extends Model {
    static associate(models) {
      this.belongsTo(models.Carrito, {
        foreignKey: 'id_pedido',
        as: 'pedido',
        onDelete: 'SET NULL'
      });
    }
  }

  Reclamo.init({
    id_reclamo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_pedido: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dni: {
      type: DataTypes.STRING(8)
    },
    nombres: {
      type: DataTypes.STRING(50)
    },
    apellidos: {
      type: DataTypes.STRING(50)
    },
    email: {
      type: DataTypes.STRING(50),
      validate: {
        isEmail: true
      }
    },
    telefono: {
      type: DataTypes.STRING(20)
    },
    tipo: {
      type: DataTypes.ENUM('R', 'Q'),
      allowNull: false
    },
    motivo: {
      type: DataTypes.TEXT
    },
    detalles: {
      type: DataTypes.TEXT
    },
    estado: {
      type: DataTypes.ENUM('N', 'R', 'S'),
      allowNull: false,
      defaultValue: 'N'
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Reclamo',
    tableName: 'reclamos',
    timestamps: false
  });

  return Reclamo;
};