const express = require('express');
const router = express.Router();
const controller = require('../../controllers/pagoController');

router.get('/', controller.findAllMine);
router.get('/:id', controller.findMineById);
router.post('/', controller.createMine);
router.post('/buscar', controller.findAllMineByField);
router.put('/:id', controller.updateMine);
//router.delete('/:id', controller.deleteMine);

module.exports = router;
