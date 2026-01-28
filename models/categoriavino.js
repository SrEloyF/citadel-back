'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CategoriaVino extends Model {
    static associate(models) {
      this.hasMany(models.Vino, { foreignKey: 'id_categoria' });
    }
  }

  CategoriaVino.init({
    id_categoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    estado: {
      type: DataTypes.ENUM('H','I'),
      allowNull: false,
      defaultValue: 'H'
    }
  }, {
    sequelize,
    modelName: 'CategoriaVino',
    tableName: 'categorias_vinos',
    timestamps: false,
  });

  return CategoriaVino;
};
