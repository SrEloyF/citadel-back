const BaseService = require('./BaseService');
const { CarritoProducto } = require('../models');
const ownershipConfig = require('../config/ownershipConfig');
const models = require('../models');

class CarritoProductoService extends BaseService {
  constructor() {
    super(CarritoProducto, ownershipConfig.CarritoProducto, models);
  }
}
module.exports = new CarritoProductoService();