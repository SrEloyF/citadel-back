'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ImagenAdicionalVino extends Model {
    static associate(models) {
      this.belongsTo(models.Vino, { foreignKey: 'id_vino' });
    }
  }

  ImagenAdicionalVino.init({
    id_imagen: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_vino: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url_img: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, isUrl: true }
    }
  }, {
    sequelize,
    modelName: 'ImagenAdicionalVino',
    tableName: 'imagenes_adicionales_vinos',
    timestamps: false,
  });

  return ImagenAdicionalVino;
};
