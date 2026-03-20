'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Banner extends Model {
    static associate(models) {
    }
  }

  Banner.init({
    id_imagen: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    url_img: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        notEmpty: true,
        isUrl: true 
      }
    },
    fecha_expiracion: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Banner',
    tableName: 'banners',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'updated_at'
  });

  return Banner;
};
