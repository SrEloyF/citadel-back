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
      volumen_ml: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
      },
      botellas_por_caja: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
      },
    },
    {
      sequelize,
      modelName: 'Presentacion',
      tableName: 'presentaciones',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['volumen_ml', 'botellas_por_caja']
        }
      ],
    }
  );

  return Presentacion;
};
