const BaseController = require('./BaseController');
const carritoService = require('../services/carritoService');
const logger = require('./../utils/logger');

class CarritoController extends BaseController {
  constructor() {
    super(carritoService);
  }

  findHistorialMine = async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await this.service.findHistorialMine(id, userId);
      res.json(result);
    } catch (err) {
      if (err.name === 'OwnershipError') return res.status(403).json({ error: 'Error de pertenencia' });
      if (err.name === 'NotFoundError') return res.status(404).json({ error: 'Registro no encontrado' });
      res.status(500).json({ error: 'Error al consultar historial de estados' });
    }
  };

  createMine = async (req, res) => {
    try {
      const result = await this.service.createMine(req.body, req.user.id);
      return res.status(201).json(result);
    } catch (err) {
      logger.error({ err }, 'Error al crear registro del usuario');
      if (err.name === 'BadRequestError') return res.status(400).json({ error: err.message });
      if (err.name === 'OwnershipError') return res.status(403).json({ error: 'Error de pertenencia' });
      if (err.name === 'NotFoundError') return res.status(404).json({ error: 'Registro no encontrado' });
      return res.status(500).json({ error: 'Error al crear registro del usuario' });
    }
  };
}

module.exports = new CarritoController();