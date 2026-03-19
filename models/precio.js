'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Precio extends Model {
    static associate(models) {
      this.belongsTo(models.Vino, {
        foreignKey: 'id_vino'
      });
    }
  }

  Precio.init(
    {
      id_precio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_vino: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'El id_vino debe ser un entero' }
        }
      },
      tipo_venta: {
        type: DataTypes.ENUM('my', 'mn'),
        allowNull: false,
        validate: {
          isIn: {
            args: [['my', 'mn']],
            msg: "El tipo_venta solo puede ser 'my' o 'mn'"
          }
        }
      },
      cantidad_minima: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: {
            args: [1],
            msg: 'La cantidad mínima debe ser al menos 1'
          }
        }
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: 'El precio no puede ser negativo'
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'Precio',
      tableName: 'precios',
      timestamps: false
    }
  );

  return Precio;
};
