const generateCrudRoutes = require('../BaseRoutes');
const imagenAdicionalVinoController = require('../../controllers/imagenAdicionalVinoController');

module.exports = generateCrudRoutes(imagenAdicionalVinoController);