const express = require('express');
const router = express.Router();
const precioController = require('../../controllers/precioController');

router.get('/', precioController.findAll);
router.get('/:id', precioController.findById);
router.post('/buscar', precioController.findByField);

module.exports = router;
