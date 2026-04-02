'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vino extends Model {
    static associate(models) {
      this.hasMany(models.ImagenAdicionalVino, { foreignKey: 'id_vino' });
      this.hasMany(models.Precio, { foreignKey: 'id_vino' });
      this.belongsTo(models.Sabor, { foreignKey: 'id_sabor' });
      this.belongsTo(models.Dulzor, { foreignKey: 'id_dulzor' });
      this.belongsTo(models.Presentacion, { foreignKey: 'id_presentacion' });
    }
  }

  Vino.init({
    id_vino: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 }
    },
    url_img_principal: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isUrl: true }
    },
    estado: {
      type: DataTypes.ENUM('D', 'A', 'P'),
      allowNull: false,
      defaultValue: 'D'
    },
    id_sabor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_dulzor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_presentacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      fields: ['id_sabor', 'id_dulzor', 'id_presentacion'],
      name: 'unique_sabor_dulzor_presentacion'
    }
  ]
  });

  return Vino;
};
