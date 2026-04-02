'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CarritoProducto extends Model {
    static associate(models) {
      this.belongsTo(models.Carrito, { foreignKey: 'id_carrito' });
      this.belongsTo(models.Precio, { foreignKey: 'id_precio' });
    }
  }

  CarritoProducto.init({
    id_carrito_producto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_carrito: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_precio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    precio_venta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 }
    }
  }, {
    sequelize,
    modelName: 'CarritoProducto',
    tableName: 'carritos_productos',
    timestamps: false,
  });

  return CarritoProducto;
};
