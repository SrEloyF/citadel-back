const generateCrudRoutes = require('../BaseRoutes');
const dulzorController = require('../../controllers/dulzorController');

module.exports = generateCrudRoutes(dulzorController);
