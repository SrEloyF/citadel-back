const BaseService = require('./BaseService');
const { Sabor } = require('../models');

class SaborService extends BaseService {
  constructor() {
    super(Sabor);
    this.allowedFields = [
      'nombre',
      'descripcion'
    ];
    this.allowedUpdateFields = [
      'nombre',
      'descripcion'
    ];
  }
}

module.exports = new SaborService();