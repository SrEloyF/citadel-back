const generateCrudRoutes = require('../BaseRoutes');
const precioController = require('../../controllers/precioController');

module.exports = generateCrudRoutes(precioController);