const BaseService = require('./BaseService');
const { Pago } = require('../models');
const ownershipConfig = require('../config/ownershipConfig');
const models = require('../models');

class PagoService extends BaseService {
  constructor() {
    super(Pago, ownershipConfig.Pago, models);
  }
}

module.exports = new PagoService();