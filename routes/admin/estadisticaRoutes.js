const express = require('express');
const router = express.Router();
const estadisticaController = require('../../controllers/estadisticaController');

router.get('/', estadisticaController.getEstadisticas);

module.exports = router;
