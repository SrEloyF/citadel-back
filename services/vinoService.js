const BaseService = require('./BaseService');
const { Vino } = require('../models');

class VinoService extends BaseService {
  constructor() {
    super(Vino);
  }
}

module.exports = new VinoService();