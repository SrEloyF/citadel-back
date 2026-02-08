const express = require('express');
const router = express.Router();
const saborController = require('../../controllers/saborController');

router.get('/', saborController.findAll);
router.get('/:id', saborController.findById);
router.post('/buscar', saborController.findByField);

module.exports = router;
