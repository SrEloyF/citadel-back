const BaseController = require('./BaseController');
const pagoService = require('../services/pagoService');

class PagoController extends BaseController {
  constructor() {
    super(pagoService);
  }
}

module.exports = new PagoController();