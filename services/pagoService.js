const BaseService = require('./BaseService');
const { Pago } = require('../models');
const ownershipConfig = require('../config/ownershipConfig');
const models = require('../models');
const BadRequestError = require('../validators/badRequestError');

class PagoService extends BaseService {
  constructor() {
    super(Pago, ownershipConfig.Pago, models);
    this.allowedFields = [
      'id_pedido',
      'metodo',
      'monto',
      'estado'
    ];

    this.allowedUpdateFields = [
    ];
  }

  async getCartTotal(userId) {
    const carrito = await this.models.Carrito.findOne({
      where: { id_usuario: userId, estado: 'E' },
      include: [
        { model: this.models.CarritoProducto },
        { model: this.models.Cupon, as: 'cupon' }
      ]
    });

    if (!carrito || !carrito.CarritoProductos || carrito.CarritoProductos.length === 0) {
      throw new BadRequestError('No hay un carrito activo con productos.');
    }

    let subtotal = 0;
    carrito.CarritoProductos.forEach(item => {
      subtotal += parseFloat(item.precio_venta) * item.cantidad;
    });

    let total = subtotal;
    let descuentoAplicado = 0;

    if (carrito.cupon) {
      const { tipo_descuento, descuento } = carrito.cupon;
      if (tipo_descuento === 'F') {
        descuentoAplicado = parseFloat(descuento);
      } else if (tipo_descuento === 'P') {
        descuentoAplicado = subtotal * (parseFloat(descuento) / 100);
      }
      total -= descuentoAplicado;
    }

    if (total < 0) total = 0;

    const envio = carrito.tipo === 'D' ? 20 : 0;
    total += envio;

    return {
      subtotal,
      descuento: descuentoAplicado,
      total,
      id_carrito: carrito.id_carrito,
      id_cupon: carrito.id_cupon,
      items_count: carrito.CarritoProductos.length
    };
  }

  async processCulqiCharge(userId, { tokenId, email }) {
    const totals = await this.getCartTotal(userId);
    const { total, id_carrito } = totals;

    const amountCents = Math.round(total * 100);

    const response = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CULQI_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountCents,
        currency_code: 'PEN',
        email: email,
        source_id: tokenId
      })
    });

    const culqiData = await response.json();

    if (!response.ok) {
      return { success: false, culqi: culqiData };
    }

    const transaction = await this.models.sequelize.transaction();
    try {
      const carrito = await this.models.Carrito.findByPk(id_carrito);

      // Actualizar estado del carrito
      await carrito.update({
        estado: 'P',
        fecha_compra: new Date()
      }, { transaction });

      // Crear registro de pago
      const pago = await this.models.Pago.create({
        id_pedido: id_carrito,
        metodo: 'T',
        monto: total,
        estado: culqiData.outcome?.user_message || 'SUCCESS'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        pago,
        culqi: culqiData
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new PagoService();