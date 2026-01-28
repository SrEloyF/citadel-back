'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Carrito extends Model {
    static associate(models) {
      this.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
      this.hasMany(models.CarritoProducto, { foreignKey: 'id_carrito' });
      this.hasOne(models.Pago, { foreignKey: 'id_pedido', as: 'pago' });
    }
  }

  Carrito.init({
    id_carrito: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('V', 'E'),
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
    updatedAt: 'updated_at'
  });

  return Carrito;
};
