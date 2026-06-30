const BaseService = require('./BaseService');
const { Carrito, Pago, Direccion, Usuario } = require('../models');
const ownershipConfig = require('../config/ownershipConfig');
const models = require('../models');
const BadRequestError = require('../validators/badRequestError');

class CarritoService extends BaseService {
  constructor() {
    super(Carrito, ownershipConfig.Carrito, models);
    this.allowedFields = [
      'estado',
      'id_cupon',
      'tipo',
      'id_direccion',
    ];
    this.allowedUpdateFields = [
      'estado',
      'id_cupon',
      'tipo',
      'id_direccion'
    ];
  }

  async findById(id) {
    return this.model.findByPk(id, {
      include: [
        {
          model: this.model.sequelize.models.Direccion,
          as: 'direccion'
        }
      ]
    });
  }

  async findAll(limit, offset) {
    return this.model.findAll({
      limit,
      offset,
      include: [
        {
          model: this.model.sequelize.models.Direccion,
          as: 'direccion'
        }
      ]
    });
  }

  async findAllWithoutPagination() {
    return this.model.findAll({
      include: [
        {
          model: this.model.sequelize.models.Direccion,
          as: 'direccion'
        }
      ]
    });
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
      where: { id_carrito: id },
      include: [
        {
          model: Pago,
          as: 'pago'
        },
        {
          model: Direccion,
          as: 'direccion',
          include: [{
            model: Usuario,
            as: 'usuario',
            where: { id_usuario: userId }
          }]
        }
      ]
    });

    if (!carrito) return;

    if (data.id_cupon !== undefined) {
      if (data.id_cupon !== null) {
        const cuponService = require('./cuponService');
        await cuponService.validateUsageForUser(data.id_cupon, userId);
      }
      if (carrito.pago && data.id_cupon === null && carrito.id_cupon !== null) {
        throw new BadRequestError('No se puede eliminar el cupón de un pedido ya pagado.');
      }
    }
  }

  async findHistorialMine(id, userId) {
    const carrito = await this.findMineById(id, userId);
    if (!carrito) return null;

    return await this.models.PedidoEstadoHistorial.findAll({
      where: { id_carrito: id },
      order: [['fecha', 'DESC']]
    });
  }

  async createMine(data = {}, userId) {
    let direccion = await Direccion.findOne({
      where: {
        id_usuario: userId,
        principal: true
      }
    });

    if (!direccion) {
      direccion = await Direccion.create({
        id_usuario: userId,
        principal: true
      });
    }

    return await Carrito.create({
      ...data,
      id_direccion: direccion.id_direccion
    });
  }
}

module.exports = new CarritoService();