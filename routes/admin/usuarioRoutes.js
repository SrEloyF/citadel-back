const express = require('express');
const generateCrudRoutes = require('../BaseRoutes');
const usuarioController = require('../../controllers/usuarioController');

const router = express.Router();
router.post('/', (req, res) => {
  return res.status(403).json({
    message: 'Registro de usuarios no permitido por esta ruta.'
  });
});

router.use('/', generateCrudRoutes(usuarioController));

module.exports = router;
