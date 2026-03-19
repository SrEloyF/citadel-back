'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const isTest = process.env.NODE_ENV === 'test';
  class Usuario extends Model {
    static associate(models) {
      this.hasMany(models.Carrito, { foreignKey: 'id_usuario' });
    }
  }

  Usuario.init({
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo: {
      type: DataTypes.ENUM('A', 'U'),
      allowNull: false,
      defaultValue: 'U'
    },
    url_img: {
      type: DataTypes.STRING,
      validate: { isUrl: true },
      allowNull: true
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isNumeric: true,
        len: [7, 8]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true, notEmpty: true }
    },
    hash_contrasena: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    direccion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ciudad: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,

    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.tipo === 'A' && !isTest) {
          throw new Error("No se puede crear un admin en producción");
        }
        if (usuario.hash_contrasena) {
          usuario.hash_contrasena = await bcrypt.hash(
            usuario.hash_contrasena,
            10
          );
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('tipo') && usuario.tipo === 'A' && !isTest) {
          throw new Error("No se puede asignar tipo admin en producción");
        }
        if (usuario.changed('hash_contrasena')) {
          usuario.hash_contrasena = await bcrypt.hash(
            usuario.hash_contrasena,
            10
          );
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['hash_contrasena'] }
    },
    scopes: {
      withPassword: { attributes: {} }
    },
  });

  return Usuario;
};
