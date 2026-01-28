const generateCrudRoutes = require('../BaseRoutes');
const vinoController = require('../../controllers/vinoController');

module.exports = generateCrudRoutes(vinoController);