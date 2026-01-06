const BaseService = require('./BaseService');
const { ImagenAdicionalVino } = require('../models');

class ImagenAdicionalVinoService extends BaseService {
  constructor() {
    super(ImagenAdicionalVino);
  }
}

module.exports = new ImagenAdicionalVinoService();