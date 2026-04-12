'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sabor extends Model {
    static associate(models) {
      this.hasMany(models.Vino, {
        foreignKey: 'id_sabor'
      });
    }
  }

  Sabor.init(
    {
      id_sabor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [2, 100]
        }
      },
    },
    {
      sequelize,
      modelName: 'Sabor',
      tableName: 'sabores',
      timestamps: false
    }
  );

  return Sabor;
};
