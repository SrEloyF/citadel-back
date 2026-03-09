const BaseService = require('./BaseService');
const { Presentacion } = require('../models');

class PresentacionService extends BaseService {
  constructor() {
    super(Presentacion);
  }
}

module.exports = new PresentacionService();