'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pago extends Model {
    static associate(models) {
      this.belongsTo(models.Carrito, { foreignKey: 'id_pedido' });
    }
  }

  Pago.init({
    id_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    metodo: {
      type: DataTypes.ENUM('E','T'),
      allowNull: false
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    estado: {
      type: DataTypes.STRING,
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
    modelName: 'Pago',
    tableName: 'pagos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'updated_at'
  });

  return Pago;
};
