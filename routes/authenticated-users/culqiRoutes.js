const express = require('express');
const router = express.Router();
const pagoController = require('../../controllers/pagoController');

router.get('/total', pagoController.getTotal);
router.post('/charge', pagoController.charge);

module.exports = router;
