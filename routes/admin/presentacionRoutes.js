const generateCrudRoutes = require('../BaseRoutes');
const presentacionController = require('../../controllers/presentacionController');

module.exports = generateCrudRoutes(presentacionController);