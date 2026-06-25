const estadisticaService = require('../services/estadisticaService');
const logger = require('../utils/logger');

class EstadisticaController {
  getEstadisticas = async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const startDate = req.query.startDate || `${currentYear}-01-01`;
      const endDate = req.query.endDate || `${currentYear}-12-31`;
      const { metric } = req.query;

      if (metric) {
        let data;
        switch (metric) {
          case 'kpi':
            data = await estadisticaService.getKPIs(startDate, endDate);
            break;
          case 'sales':
            data = await estadisticaService.getVentasMensuales(startDate, endDate);
            break;
          case 'top-products':
            data = await estadisticaService.getTopProductos(startDate, endDate);
            break;
          case 'order-statuses':
            data = await estadisticaService.getEstadosPedidos(startDate, endDate);
            break;
          case 'flavors':
            data = await estadisticaService.getVentasSabores(startDate, endDate);
            break;
          case 'cities':
            data = await estadisticaService.getCiudadesVentas(startDate, endDate);
            break;
          case 'low-stock':
            data = await estadisticaService.getProductosBajoStock(startDate, endDate);
            break;
          default:
            return res.status(400).json({ error: `Métrica no válida: ${metric}` });
        }
        return res.json({ data });
      }

      // If no specific metric is requested, fetch everything in parallel
      const [
        kpi,
        ventasMensuales,
        topProductos,
        estadosPedidos,
        ventasSabores,
        ciudadesVentas,
        productosBajoStock
      ] = await Promise.all([
        estadisticaService.getKPIs(startDate, endDate),
        estadisticaService.getVentasMensuales(startDate, endDate),
        estadisticaService.getTopProductos(startDate, endDate),
        estadisticaService.getEstadosPedidos(startDate, endDate),
        estadisticaService.getVentasSabores(startDate, endDate),
        estadisticaService.getCiudadesVentas(startDate, endDate),
        estadisticaService.getProductosBajoStock(startDate, endDate)
      ]);

      return res.json({
        kpi,
        ventasMensuales,
        topProductos,
        estadosPedidos,
        ventasSabores,
        ciudadesVentas,
        productosBajoStock
      });
    } catch (error) {
      logger.error({ err: error }, 'Error al obtener estadísticas del panel admin');
      return res.status(500).json({ error: 'Error interno del servidor al obtener estadísticas' });
    }
  };
}

module.exports = new EstadisticaController();
