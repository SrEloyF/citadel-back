'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vino extends Model {
    static associate(models) {
      this.belongsTo(models.CategoriaVino, { foreignKey: 'id_categoria' });
      this.hasMany(models.ImagenAdicionalVino, { foreignKey: 'id_vino' });
      this.hasMany(models.CarritoProducto, { foreignKey: 'id_vino' });
    }
  }

  Vino.init({
    id_vino: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    volumen_ml: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    precio: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: { min: 0 }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 }
    },
    estado: {
      type: DataTypes.ENUM('D','A'),
      allowNull: false,
      defaultValue: 'D'
    },
    url_img_principal: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isUrl: true }
    }
  }, {
    sequelize,
    modelName: 'Vino',
    tableName: 'vinos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'updated_at'
  });

  return Vino;
};
