const BaseService = require('./BaseService');
const { CarritoProducto } = require('../models');
const ownershipConfig = require('../config/ownershipConfig');
const models = require('../models');

class CarritoProductoService extends BaseService {
  constructor() {
    super(CarritoProducto, ownershipConfig.CarritoProducto, models);
    this.allowedFields = [
      'id_carrito',
      'id_vino',
      'cantidad',
    ];
    this.allowedUpdateFields = [
      'cantidad'
    ];
  }
}
module.exports = new CarritoProductoService();