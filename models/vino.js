'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vino extends Model {
    static associate(models) {
      this.hasMany(models.ImagenAdicionalVino, { foreignKey: 'id_vino' });
      this.hasMany(models.CarritoProducto, { foreignKey: 'id_vino' });
      this.hasMany(models.Precio, { foreignKey: 'id_vino' });
      this.belongsTo(models.Sabor, { foreignKey: 'id_sabor' });
      this.belongsTo(models.Presentacion, { foreignKey: 'id_presentacion' });
    }
  }

  Vino.init({
    id_vino: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_sabor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_presentacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    volumen_ml: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 }
    },
    estado: {
      type: DataTypes.ENUM('D', 'A', 'P'),
      allowNull: false,
      defaultValue: 'D'
    },
    url_img_principal: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isUrl: true }
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
  }, {
    sequelize,
    modelName: 'Vino',
    tableName: 'vinos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
    indexes: [
    {
      unique: true,
      fields: ['id_sabor', 'id_presentacion', 'volumen_ml'],
      name: 'unique_sabor_presentacion_volumen'
    }
  ]
  });

  return Vino;
};
