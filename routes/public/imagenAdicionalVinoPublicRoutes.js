const express = require('express');
const router = express.Router();
const imagenAdicionalVinoController = require('../../controllers/imagenAdicionalVinoController');

router.get('/', imagenAdicionalVinoController.findAll);
router.get('/:id', imagenAdicionalVinoController.findById);
router.post('/buscar', imagenAdicionalVinoController.findByField);

module.exports = router;
