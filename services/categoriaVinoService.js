const BaseService = require('./BaseService');
const { CategoriaVino } = require('../models');

class CategoriaVinoService extends BaseService {
  constructor() {
    super(CategoriaVino);
  }
}

module.exports = new CategoriaVinoService();