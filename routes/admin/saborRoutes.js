const generateCrudRoutes = require('../BaseRoutes');
const saborController = require('../../controllers/saborController');

module.exports = generateCrudRoutes(saborController);