const BaseController = require('./BaseController');
const ReclamoService = require('../services/reclamoService');

class ReclamoController extends BaseController {
  constructor() {
    super(ReclamoService);
  }
}

module.exports = new ReclamoController();