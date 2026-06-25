'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vinos', 'slug', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });

    const [vinos] = await queryInterface.sequelize.query(
      'SELECT id_vino, nombre FROM vinos'
    );

    for (const vino of vinos) {
      const slug = vino.nombre
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');

      await queryInterface.sequelize.query(
        'UPDATE vinos SET slug = :slug WHERE id_vino = :id',
        {
          replacements: {
            slug,
            id: vino.id_vino
          }
        }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('vinos', 'slug');
  }
};