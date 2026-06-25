const { Pago, Carrito, CarritoProducto, Vino, Sabor, Usuario, Precio, sequelize } = require('../models');
const { Op } = require('sequelize');

class EstadisticaService {

  _parseRange(startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);
    return { start, end };
  }

  async getKPIs(startDate, endDate) {
    const { start, end } = this._parseRange(startDate, endDate);

    // 1. Ventas Totales (Sum of amount from Pago table)
    const totalSalesObj = await Pago.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('monto')), 'total']],
      where: {
        fecha_creacion: {
          [Op.between]: [start, end]
        }
      }
    });
    const totalSales = parseFloat(totalSalesObj?.getDataValue('total') || 0);

    // 2. Productos Vendidos (Sum of quantities of CarritoProducto where state is checked/paid/completed)
    const productsSoldObj = await CarritoProducto.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('cantidad')), 'total']],
      include: [{
        model: Carrito,
        attributes: [],
        required: true,
        where: {
          estado: { [Op.ne]: 'E' },
          fecha_compra: { [Op.between]: [start, end] }
        }
      }],
      raw: true
    });
    const productsSold = parseInt(productsSoldObj?.total || 0);

    // 3. Total Usuarios (Registered in date range, type 'U')
    const totalUsers = await Usuario.count({
      where: {
        tipo: 'U',
        fecha_creacion: { [Op.between]: [start, end] }
      }
    });

    // 4. Usuarios que compraron (Unique clients with orders placed in range)
    const usersPurchasedObj = await Carrito.findOne({
      attributes: [[sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('id_usuario'))), 'count']],
      where: {
        estado: { [Op.ne]: 'E' },
        fecha_compra: { [Op.between]: [start, end] }
      },
      raw: true
    });
    const usersPurchased = parseInt(usersPurchasedObj?.count || 0);

    // 5. Usuarios nuevos (Registered in range, type 'U')
    const newClients = await Usuario.count({
      where: {
        tipo: 'U',
        fecha_creacion: { [Op.between]: [start, end] }
      }
    });

    // 6. Costo Promedio (Average payment amount)
    const avgSaleCostObj = await Pago.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('monto')), 'average']],
      where: {
        fecha_creacion: { [Op.between]: [start, end] }
      }
    });
    const avgSaleCost = parseFloat(avgSaleCostObj?.getDataValue('average') || 0);

    return {
      totalSales,
      productsSold,
      totalUsers,
      usersPurchased,
      newClients,
      avgSaleCost
    };
  }

  async getVentasMensuales(startDate, endDate) {
    const { start, end } = this._parseRange(startDate, endDate);

    const result = await Carrito.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('fecha_compra'), '%Y-%m'), 'mes'],
        [sequelize.fn('COUNT', sequelize.col('id_carrito')), 'total']
      ],
      where: {
        estado: { [Op.ne]: 'E' },
        fecha_compra: { [Op.between]: [start, end] }
      },
      group: [sequelize.literal("DATE_FORMAT(fecha_compra, '%Y-%m')")],
      order: [[sequelize.literal('mes'), 'ASC']],
      raw: true
    });

    return result.map(row => ({
      mes: row.mes,
      total: parseInt(row.total || 0)
    }));
  }

  async getTopProductos(startDate, endDate) {
    const { start, end } = this._parseRange(startDate, endDate);

    const result = await CarritoProducto.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('cantidad')), 'cantidad_total']
      ],
      include: [
        {
          model: Carrito,
          attributes: [],
          required: true,
          where: {
            estado: { [Op.ne]: 'E' },
            fecha_compra: { [Op.between]: [start, end] }
          }
        },
        {
          model: Precio,
          attributes: ['id_vino'],
          required: true,
          include: [{
            model: Vino,
            attributes: ['nombre'],
            required: true
          }]
        }
      ],
      group: ['Precio.id_vino', 'Precio->Vino.id_vino', 'Precio->Vino.nombre'],
      order: [[sequelize.literal('cantidad_total'), 'DESC']],
      limit: 5,
      raw: true
    });

    return result.map(row => ({
      nombre: row['Precio.Vino.nombre'],
      cantidad: parseInt(row.cantidad_total || 0)
    }));
  }

  async getEstadosPedidos(startDate, endDate) {
    const { start, end } = this._parseRange(startDate, endDate);

    const result = await Carrito.findAll({
      attributes: [
        'estado',
        [sequelize.fn('COUNT', sequelize.col('id_carrito')), 'count']
      ],
      where: {
        estado: { [Op.ne]: 'E' },
        fecha_compra: { [Op.between]: [start, end] }
      },
      group: ['estado'],
      raw: true
    });

    return result.map(row => ({
      estado: row.estado,
      count: parseInt(row.count || 0)
    }));
  }

  async getVentasSabores(startDate, endDate) {
    const { start, end } = this._parseRange(startDate, endDate);

    const result = await CarritoProducto.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('CarritoProducto.id_carrito'))), 'cantidad_total']
      ],
      include: [
        {
          model: Carrito,
          attributes: [],
          required: true,
          where: {
            estado: { [Op.ne]: 'E' },
            fecha_compra: { [Op.between]: [start, end] }
          }
        },
        {
          model: Precio,
          attributes: [],
          required: true,
          include: [{
            model: Vino,
            attributes: [],
            required: true,
            include: [{
              model: Sabor,
              attributes: ['nombre'],
              required: true
            }]
          }]
        }
      ],
      group: ['Precio->Vino->Sabor.id_sabor', 'Precio->Vino->Sabor.nombre'],
      order: [[sequelize.literal('cantidad_total'), 'DESC']],
      raw: true
    });

    return result.map(row => ({
      sabor: row['Precio.Vino.Sabor.nombre'],
      cantidad: parseInt(row.cantidad_total || 0)
    }));
  }

  async getCiudadesVentas(startDate, endDate) {
    const { start, end } = this._parseRange(startDate, endDate);

    const result = await Pago.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('monto')), 'total_ventas']
      ],
      include: [{
        model: Carrito,
        required: true,
        include: [{
          model: Usuario,
          attributes: ['ciudad'],
          required: true
        }]
      }],
      where: {
        fecha_creacion: { [Op.between]: [start, end] }
      },
      group: ['Carrito->Usuario.ciudad'],
      order: [[sequelize.literal('total_ventas'), 'DESC']],
      limit: 5,
      raw: true
    });

    return result.map(row => ({
      ciudad: row['Carrito.Usuario.ciudad'] || 'Sin ciudad',
      total: parseFloat(row.total_ventas || 0)
    }));
  }

  async getProductosBajoStock(startDate, endDate) {
    const result = await Vino.findAll({
      attributes: ['nombre', 'stock'],
      order: [['stock', 'ASC']],
      limit: 5,
      raw: true
    });

    return result;
  }
}

module.exports = new EstadisticaService();
