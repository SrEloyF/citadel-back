'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Precio extends Model {
    static associate(models) {
      this.belongsTo(models.Vino, { foreignKey: 'id_vino' });
      this.hasMany(models.CarritoProducto, { foreignKey: 'id_precio' });
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
