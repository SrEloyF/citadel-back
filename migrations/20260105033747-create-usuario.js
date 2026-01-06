'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id_usuario: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tipo: {
        type: Sequelize.ENUM('A','U'),
        allowNull: false,
        defaultValue: 'U'
      },
      url_img: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nombres: {
        type: Sequelize.STRING,
        allowNull: false
      },
      apellidos: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dni: {
        type: Sequelize.STRING(8),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      hash_contrasena: {
        type: Sequelize.STRING,
        allowNull: false
      },
      telefono: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      direccion: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      ciudad: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      fecha_creacion: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};
