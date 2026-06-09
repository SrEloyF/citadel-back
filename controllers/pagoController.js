const BaseController = require('./BaseController');
const pagoService = require('../services/pagoService');
const logger = require('../utils/logger');

class PagoController extends BaseController {
  constructor() {
    super(pagoService);
  }

  getTotal = async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await this.service.getCartTotal(userId);
      return res.json(result);
    } catch (error) {
      logger.error({ err: error }, 'Error al obtener el total del carrito');
      
      if (error.name === 'BadRequestError') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error interno al calcular el total'
      });
    }
  };

  charge = async (req, res) => {
    try {
      const userId = req.user.id;
      const { tokenId, email } = req.body;

      if (!tokenId || !email) {
        return res.status(400).json({
          success: false,
          message: 'tokenId y email son requeridos'
        });
      }

      const result = await this.service.processCulqiCharge(userId, { tokenId, email });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    } catch (error) {
      logger.error({ err: error }, 'Error al procesar el cargo con Culqi');
      
      if (error.name === 'BadRequestError') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error interno al procesar el pago'
      });
    }
  };
}

module.exports = new PagoController();