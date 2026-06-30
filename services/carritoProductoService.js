const BaseService = require('./BaseService');
const { CarritoProducto } = require('../models');
const ownershipConfig = require('../config/ownershipConfig');
const models = require('../models');

class CarritoProductoService extends BaseService {
  constructor() {
    super(CarritoProducto, ownershipConfig.CarritoProducto, models);
    this.allowedFields = [
      'id_carrito',
      'id_precio',
      'cantidad',
      'precio_venta'
    ];
    this.allowedUpdateFields = [
      'cantidad'
    ];
  }

  async deleteMine(id, userId) {
    const instance = await this.model.findOne({
      where: { id_carrito_producto: id },
      include: [{
        model: this.models.Carrito,
        as: 'carrito',
        include: [{
          model: this.models.Direccion,
          as: 'direccion',
          where: {
            id_usuario: userId
          },
          required: true
        }],
        required: true
      }]
    });

    if (!instance) {
      const exists = await this.model.findByPk(id);
      if (!exists) throw new NotFoundError();
      throw new OwnershipError();
    }

    await instance.destroy();
    return true;
  }
}
module.exports = new CarritoProductoService();