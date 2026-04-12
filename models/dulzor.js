'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Dulzor extends Model {
    static associate(models) {
      this.hasMany(models.Vino, {
        foreignKey: 'id_dulzor'
      });
    }
  }

  Dulzor.init(
    {
      id_dulzor: {
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
      modelName: 'Dulzor',
      tableName: 'dulzores',
      timestamps: false
    }
  );

  return Dulzor;
};
