const express = require('express');
const router = express.Router();
const presentacionController = require('../../controllers/presentacionController');

router.get('/', presentacionController.findAll);
router.get('/:id', presentacionController.findById);
router.post('/buscar', presentacionController.findByField);

module.exports = router;
