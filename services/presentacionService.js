const BaseService = require('./BaseService');
const { Presentacion } = require('../models');

class PresentacionService extends BaseService {
  constructor() {
    super(Presentacion);
    this.allowedFields = [
      'nombre'
    ];
    this.allowedUpdateFields = [
      'nombre'
    ];
  }
}

module.exports = new PresentacionService();