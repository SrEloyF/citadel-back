'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Direccion extends Model {
    static associate(models) {
      this.belongsTo(models.Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
      this.hasMany(models.Carrito, { foreignKey: 'id_direccion' });
    }
  }

  Direccion.init({
    id_direccion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_departamento: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_provincia: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_distrito: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    calle: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        notEmpty: true
      }
    },
    numero: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        notEmpty: true
      }
    },
    cp: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    principal: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },

  }, {
    sequelize,
    modelName: 'Direccion',
    tableName: 'direcciones',
    timestamps: false
  });

  return Direccion;
};