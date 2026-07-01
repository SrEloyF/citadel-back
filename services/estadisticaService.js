const { Pago, Carrito, CarritoProducto, Vino, Sabor, Usuario, Precio, Direccion, sequelize } = require('../models');
const { Op } = require('sequelize');

class EstadisticaService {

  _parseRange(startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);
    return { start, end };
  }

  async getKPIs(startDate, endDate) {
    const { start, end } = this._parseRange(startDate, endDate);

    const totalSalesObj = await Pago.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('monto')), 'total']],
      where: {
        fecha_creacion: {
          [Op.between]: [start, end]
        }
      }
    });
    const totalSales = parseFloat(totalSalesObj?.getDataValue('total') || 0);

    const productsSoldObj = await CarritoProducto.findOne({
      attributes: [[sequelize.fn('SUM', sequelize.col('cantidad')), 'total']],
      include: [{
        model: Carrito,
        as: 'carrito',
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

    const totalUsers = await Usuario.count({
      where: {
        tipo: 'U',
        fecha_creacion: { [Op.between]: [start, end] }
      }
    });

    const usersPurchasedObj = await Carrito.findOne({
      attributes: [
        [
          sequelize.fn(
            'COUNT',
            sequelize.fn(
              'DISTINCT',
              sequelize.col('direccion.id_usuario')
            )
          ),
          'count'
        ]
      ],
      include: [{
        model: Direccion,
        as: 'direccion',
        attributes: [],
        required: true
      }],
      where: {
        estado: { [Op.ne]: 'E' },
        fecha_compra: { [Op.between]: [start, end] }
      },
      raw: true
    });
    const usersPurchased = parseInt(usersPurchasedObj?.count || 0);

    const newClients = await Usuario.count({
      where: {
        tipo: 'U',
        fecha_creacion: { [Op.between]: [start, end] }
      }
    });

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

    const dialect = sequelize.getDialect();

    const monthExpression =
      dialect === 'postgres'
        ? `TO_CHAR("fecha_compra", 'YYYY-MM')`
        : `DATE_FORMAT(fecha_compra, '%Y-%m')`;

    const result = await Carrito.findAll({
      attributes: [
        [sequelize.literal(monthExpression), 'mes'],
        [sequelize.fn('COUNT', sequelize.col('id_carrito')), 'total']
      ],
      where: {
        estado: { [Op.ne]: 'E' },
        fecha_compra: { [Op.between]: [start, end] }
      },
      group: [sequelize.literal(monthExpression)],
      order: [[sequelize.literal('mes'), 'ASC']],
      raw: true
    });

    return result.map(row => ({
      mes: row.mes,
      total: Number(row.total) || 0
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
          as: 'carrito',
          attributes: [],
          required: true,
          where: {
            estado: { [Op.ne]: 'E' },
            fecha_compra: { [Op.between]: [start, end] }
          }
        },
        {
          model: Precio,
          as: 'precio',
          attributes: ['id_vino'],
          required: true,
          include: [{
            model: Vino,
            attributes: ['nombre'],
            required: true
          }]
        }
      ],
      group: [
        'precio.id_vino',
        'precio->Vino.id_vino',
        'precio->Vino.nombre'
      ],
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
          as: 'carrito',
          attributes: [],
          required: true,
          where: {
            estado: { [Op.ne]: 'E' },
            fecha_compra: { [Op.between]: [start, end] }
          }
        },
        {
          model: Precio,
          as: 'precio',
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
      group: ['precio->Vino->Sabor.id_sabor', 'precio->Vino->Sabor.nombre'],
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
        [sequelize.col('Carrito->direccion.id_departamento'), 'ciudad_departamento'],
        [sequelize.fn('SUM', sequelize.col('monto')), 'total_ventas']
      ],
      include: [{
        model: Carrito,
        required: true,
        attributes: [],
        include: [{
          model: Direccion,
          as: 'direccion',
          required: true,
          attributes: [] 
        }]
      }],
      where: {
        fecha_creacion: { [Op.between]: [start, end] }
      },
      group: ['Carrito->direccion.id_departamento'],
      order: [[sequelize.literal('total_ventas'), 'DESC']],
      limit: 5,
      raw: true
    });

    return result.map(row => ({
      ciudad: row.ciudad_departamento || 'Sin ciudad',
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
