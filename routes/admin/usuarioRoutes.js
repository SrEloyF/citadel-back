const generateCrudRoutes = require('../BaseRoutes');
const usuarioController = require('../../controllers/usuarioController');

const router = generateCrudRoutes(usuarioController, { exclude: ['create'] });

router.post('/', (req, res) => {
  return res.status(403).json({
    message: 'Registro de usuarios no permitido por esta ruta.'
  });
});

module.exports = router;
