const BaseService = require('./BaseService');
const { Precio } = require('../models');

class PrecioService extends BaseService {
  constructor() {
    super(Precio);
  }
}

module.exports = new PrecioService();