const generateCrudRoutes = require('../BaseRoutes');
const cuponController = require('../../controllers/cuponController');

const router = generateCrudRoutes(cuponController, {
  exclude: ['create', 'update', 'updateFields', 'delete']
});

module.exports = router;