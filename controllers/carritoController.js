const BaseController = require('./BaseController');
const carritoService = require('../services/carritoService');

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
}

module.exports = new CarritoController();