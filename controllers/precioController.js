const BaseController = require('./BaseController');
const PrecioService = require('../services/precioService');

class PrecioController extends BaseController {
  constructor() {
    super(PrecioService);
  }
}

module.exports = new PrecioController();