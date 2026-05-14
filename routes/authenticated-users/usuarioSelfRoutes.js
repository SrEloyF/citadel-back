const express = require('express');
const router = express.Router();
const controller = require('../../controllers/usuarioController');
const upload = require('../../middlewares/upload');

router.get('/', controller.findAllMine);
router.get('/:id', controller.findMineById);

router.patch('/:id', upload.single('imagen'), controller.updateAllMineFields);

router.put('/:id', upload.single('imagen'), controller.updateMine);

module.exports = router;