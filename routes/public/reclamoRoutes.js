const generateCrudRoutes = require('../BaseRoutes');
const reclamoController = require('../../controllers/reclamoController');

const router = generateCrudRoutes(reclamoController, {
  exclude: ['findAll', 'findById', 'update', 'delete', 'findByField', 'updateFields']
});

module.exports = router;