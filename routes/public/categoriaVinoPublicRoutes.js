const express = require('express');
const router = express.Router();
const categoriaVinoController = require('../../controllers/categoriaVinoController');

router.get('/', categoriaVinoController.findAll);
router.get('/:id', categoriaVinoController.findById);
router.post('/buscar', categoriaVinoController.findByField);

module.exports = router;
