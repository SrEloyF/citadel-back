const generateCrudRoutes = require('./BaseRoutes');
const categoriaVinoController = require('../controllers/categoriaVinoController');

module.exports = generateCrudRoutes(categoriaVinoController);