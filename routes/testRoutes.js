const express = require('express');
const router = express.Router();
const { sequelize, Usuario } = require('../models');
const bcrypt = require('bcrypt');

if (process.env.NODE_ENV !== 'test') {
  router.use((req, res) => res.status(404).send('Not found'));
} else {
  router.post('/reset-db', async (req, res) => {
    try {
      await sequelize.sync({ force: true , logging: console.log});

      const hash_contrasena = 'wasd1234';
      const user_hash = '123456';

      await Usuario.bulkCreate(
        [
          { nombres: 'Admin', apellidos: 'Test', email: 'admin@gmail.com', hash_contrasena, tipo: 'A' },
          { nombres: 'User', apellidos: 'Test', email: 'test@gmail.com', hash_contrasena: user_hash, tipo: 'U' }
        ],
        {
          individualHooks: true
        });

      res.status(200).json({ message: 'Base de datos reseteada y sembrada' });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: error.message,
        name: error.name,
        parent: error.parent,
        original: error.original
      });
    }
  });
}

module.exports = router;