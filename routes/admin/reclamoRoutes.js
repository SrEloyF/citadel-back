const generateCrudRoutes = require('../BaseRoutes');
const reclamoController = require('../../controllers/reclamoController');

const router = generateCrudRoutes(reclamoController);

module.exports = router;