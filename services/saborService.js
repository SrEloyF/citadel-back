const BaseService = require('./BaseService');
const { Sabor } = require('../models');

class SaborService extends BaseService {
  constructor() {
    super(Sabor);
  }
}

module.exports = new SaborService();