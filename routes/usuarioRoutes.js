const generateCrudRoutes = require('./BaseRoutes');
const usuarioController = require('../controllers/usuarioController');

module.exports = generateCrudRoutes(usuarioController);