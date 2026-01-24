const express = require('express');
const router = express.Router();
const vinoController = require('../../controllers/vinoController');

router.get('/', vinoController.findAll);
router.get('/:id', vinoController.findById);
router.post('/buscar', vinoController.findByField);

module.exports = router;
