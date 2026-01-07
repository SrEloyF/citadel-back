const express = require('express');

function generateCrudRoutes(controller) {
  const router = express.Router();

  router.get('/', controller.findAll);
  router.post('/', controller.create);
  router.get('/:id', controller.findById);
  router.put('/:id', controller.update); // probar
  router.delete('/:id', controller.delete);
  //router.patch('/:id', controller.updateField);
  router.post('/buscar', controller.findByField);
  router.patch('/:id', controller.updateFields);

  return router;
}

module.exports = generateCrudRoutes;