const BaseService = require('./BaseService');
const { Precio } = require('../models');

class PrecioService extends BaseService {
  constructor() {
    super(Precio);
    this.allowedFields = [
      'id_vino',
      'cantidad_minima',
      'precio'
    ];
    this.allowedUpdateFields = [
      'cantidad_minima',
      'precio'
    ];
  }
}

module.exports = new PrecioService();