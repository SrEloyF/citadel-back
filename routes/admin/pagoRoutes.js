const generateCrudRoutes = require('../BaseRoutes');
const pagoController = require('../../controllers/pagoController');

module.exports = generateCrudRoutes(pagoController);