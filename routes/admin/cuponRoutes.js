const generateCrudRoutes = require('../BaseRoutes');
const cuponController = require('../../controllers/cuponController');

const router = generateCrudRoutes(cuponController);

module.exports = router;