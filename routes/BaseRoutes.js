const express = require('express');

function generateCrudRoutes(controller) {
  const router = express.Router();

  router.get('/', controller.findAll);
  router.get('/:id', controller.findById);
  router.post('/', controller.create);
  router.post('/buscar', controller.findByField);
  router.put('/:id', controller.update);
  router.patch('/:id', controller.updateFields);
  router.delete('/:id', controller.delete);

  return router;
}

module.exports = generateCrudRoutes;