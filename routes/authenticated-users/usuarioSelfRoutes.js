const express = require('express');
const router = express.Router();
const controller = require('../../controllers/usuarioController');

router.get('/', controller.findAllMine);
router.get('/:id', controller.findMineById);
//router.put('/:id', controller.updateMine);

module.exports = router;
