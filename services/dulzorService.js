const BaseService = require('./BaseService');
const { Dulzor } = require('../models');

class DulzorService extends BaseService {
  constructor() {
    super(Dulzor);
    this.allowedFields = [
      'nombre'
    ];
    this.allowedUpdateFields = [
      'nombre'
    ];
  }
}

module.exports = new DulzorService();
