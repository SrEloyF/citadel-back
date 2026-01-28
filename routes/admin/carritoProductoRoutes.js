const generateCrudRoutes = require('../BaseRoutes');
const carritoProductoController = require('../../controllers/carritoProductoController');

module.exports = generateCrudRoutes(carritoProductoController);