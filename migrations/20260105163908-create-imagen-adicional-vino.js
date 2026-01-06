'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('imagenes_adicionales_vinos', {
      id_imagen: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_vino: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'vinos', key: 'id_vino' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      url_img: {
        type: Sequelize.STRING,
        allowNull: false
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('imagenes_adicionales_vinos');
  }
};
