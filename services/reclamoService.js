const BaseService = require('./BaseService');
const { Reclamo } = require('../models');

class ReclamoService extends BaseService {
  constructor() {
    super(Reclamo);
    this.allowedFields = [
      'id_pedido',
      'dni',
      'nombres',
      'apellidos',
      'email',
      'telefono',
      'tipo',
      'motivo',
      'detalles',
      'estado'
    ];
    this.allowedUpdateFields = [
      'estado'
    ];
  }
}

module.exports = new ReclamoService();