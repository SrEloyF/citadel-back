const express = require('express');
const router = express.Router();
const dulzorController = require('../../controllers/dulzorController');

router.get('/', dulzorController.findAll);
router.get('/:id', dulzorController.findById);
router.post('/buscar', dulzorController.findByField);

module.exports = router;
