const generateCrudRoutes = require('../BaseRoutes');
const carritoController = require('../../controllers/carritoController');

module.exports = generateCrudRoutes(carritoController);