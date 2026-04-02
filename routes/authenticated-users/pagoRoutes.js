const express = require('express');
const router = express.Router();
const controller = require('../../controllers/pagoController');

router.get('/', controller.findAllMine);
router.get('/:id', controller.findMineById);
router.post('/', controller.createMine);
router.post('/buscar', controller.findAllMineByField);
router.patch('/:id', controller.updateAllMineFields);
router.put('/:id', controller.updateMine);

module.exports = router;
