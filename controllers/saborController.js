const BaseController = require('./BaseController');
const SaborService = require('../services/saborService');

class SaborController extends BaseController {
  constructor() {
    super(SaborService);
  }
}

module.exports = new SaborController();