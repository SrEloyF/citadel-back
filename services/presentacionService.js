const BaseService = require('./BaseService');
const { Presentacion } = require('../models');

class PresentacionService extends BaseService {
  constructor() {
    super(Presentacion);
    this.allowedFields = [
      'volumen_ml',
      'botellas_por_caja'
    ];
    this.allowedUpdateFields = [
      'volumen_ml',
      'botellas_por_caja'
    ];
  }
}

module.exports = new PresentacionService();