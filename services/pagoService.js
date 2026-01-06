const BaseService = require('./BaseService');
const { Pago } = require('../models');

class PagoService extends BaseService {
  constructor() {
    super(Pago);
  }
}

module.exports = new PagoService();