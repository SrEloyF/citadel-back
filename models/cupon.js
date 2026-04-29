'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cupon extends Model {
    static associate(models) {
      Cupon.hasMany(models.Carrito, {
        foreignKey: 'id_cupon'
      });
    }
  }

  Cupon.init(
    {
      id_cupon: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      tipo_descuento: {
        type: DataTypes.ENUM('F', 'P'),
        allowNull: false
      },
      descuento: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      monto_minimo: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false
      },
      fecha_fin: {
        type: DataTypes.DATE,
        allowNull: false
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'Cupon',
      tableName: 'cupones',
      timestamps: false
    }
  );

  return Cupon;
};