const BaseService = require('./BaseService');
const { Cupon, Carrito, Pago } = require('../models');
const BadRequestError = require('../validators/badRequestError');

class CuponService extends BaseService {
  constructor() {
    super(Cupon);
    this.allowedFields = [
      'codigo',
      'tipo_descuento',
      'descuento',
      'monto_minimo',
      'fecha_inicio',
      'fecha_fin',
      'activo'
    ];
    this.allowedUpdateFields = [
      'tipo_descuento',
      'descuento',
      'monto_minimo',
      'fecha_inicio',
      'fecha_fin',
      'activo'
    ];
  }

  async findById(id) {
    const cupon = await super.findById(id);
    if (cupon) {
      return this._checkAndSyncActiveStatus(cupon);
    }
    return cupon;
  }

  async findAllWithoutPagination() {
    const cupones = await super.findAllWithoutPagination();
    return Promise.all(cupones.map(c => this._checkAndSyncActiveStatus(c)));
  }

  async findAll(limit, offset) {
    const cupones = await super.findAll(limit, offset);
    return Promise.all(cupones.map(c => this._checkAndSyncActiveStatus(c)));
  }

  async _checkAndSyncActiveStatus(cupon) {
    const now = new Date();
    if (cupon.activo && cupon.fecha_fin < now) {
      cupon.activo = false;
      await cupon.save();
    }
    return cupon;
  }

  async delete(id) {
    const usageCount = await Carrito.count({
      where: { id_cupon: id },
      include: [{
        model: Pago,
        as: 'pago',
        required: true
      }]
    });

    if (usageCount > 0) {
      throw new Error('No se puede eliminar un cupón que ya ha sido usado en compras.');
    }

    return super.delete(id);
  }

  async validateUsageForUser(cuponId, usuarioId) {
    const alreadyUsed = await Carrito.findOne({
      where: {
        id_usuario: usuarioId,
        id_cupon: cuponId
      },
      include: [{
        model: Pago,
        as: 'pago',
        required: true
      }]
    });

    if (alreadyUsed) {
      throw new BadRequestError('El usuario ya ha utilizado este cupón en una compra anterior.');
    }
    return true;
  }
}

module.exports = new CuponService();