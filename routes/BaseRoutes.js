const express = require('express');

function generateCrudRoutes(controller, options = {}) {
  const router = express.Router();
  const exclude = options.exclude || [];

  if (!exclude.includes('findAll')) router.get('/', controller.findAll);
  if (!exclude.includes('findById')) router.get('/:id', controller.findById);
  if (!exclude.includes('create')) router.post('/', controller.create);
  if (!exclude.includes('findByField')) router.post('/buscar', controller.findByField);
  if (!exclude.includes('update')) router.put('/:id', controller.update);
  if (!exclude.includes('updateFields')) router.patch('/:id', controller.updateFields);
  if (!exclude.includes('delete')) router.delete('/:id', controller.delete);

  return router;
}

module.exports = generateCrudRoutes;