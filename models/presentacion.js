'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Presentacion extends Model {
    static associate(models) {
      this.hasMany(models.Vino, {
        foreignKey: 'id_presentacion'
      });
    }
  }

  Presentacion.init(
    {
      id_presentacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'El nombre es obligatorio' },
          notEmpty: { msg: 'El nombre no puede estar vacío' },
          len: {
            args: [2, 100],
            msg: 'El nombre debe tener entre 2 y 100 caracteres'
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'Presentacion',
      tableName: 'presentaciones',
      timestamps: false
    }
  );

  return Presentacion;
};
