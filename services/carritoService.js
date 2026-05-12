const BaseService = require('./BaseService');
const { Carrito, Pago } = require('../models');
const ownershipConfig = require('../config/ownershipConfig');
const models = require('../models');
const BadRequestError = require('../validators/badRequestError');

class CarritoService extends BaseService {
  constructor() {
    super(Carrito, ownershipConfig.Carrito, models);
    this.allowedFields = [
      'id_usuario',
      'estado',
      'id_cupon'
    ];
    this.allowedUpdateFields = [
      'estado',
      'id_cupon'
    ];
  }

  async updateMine(id, data, userId) {
    await this._validateCoupon(id, data, userId);
    return super.updateMine(id, data, userId);
  }

  async updateAllMineFields(id, data, userId) {
    await this._validateCoupon(id, data, userId);
    return super.updateAllMineFields(id, data, userId);
  }

  async _validateCoupon(id, data, userId) {
    const carrito = await this.model.findOne({
      where: { id_carrito: id, id_usuario: userId },
      include: [{ model: Pago, as: 'pago' }]
    });

    if (!carrito) return;

    if (data.id_cupon !== undefined) {
      if (carrito.pago && data.id_cupon === null && carrito.id_cupon !== null) {
        throw new BadRequestError('No se puede eliminar el cupón de un pedido ya pagado.');
      }

      if (data.id_cupon !== null && data.id_cupon !== carrito.id_cupon) {
        const cuponService = require('./cuponService');
        const cupon = await cuponService.findById(data.id_cupon);
        
        if (!cupon || !cupon.activo) {
          throw new BadRequestError('El cupón no existe o no está activo.');
        }
        
        await cuponService.validateUsageForUser(data.id_cupon, userId);
      }
    }
  }
}

module.exports = new CarritoService();