const BaseService = require('./BaseService');
const { Carrito } = require('../models');
const ownershipConfig = require('../config/ownershipConfig');
const models = require('../models');

class CarritoService extends BaseService {
  constructor() {
    super(Carrito, ownershipConfig.Carrito, models);
    this.allowedFields = [
      'id_usuario',
      'estado',
    ];
    this.allowedUpdateFields = [
      'estado'
    ];
  }
}

module.exports = new CarritoService();