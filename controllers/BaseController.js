const validarCamposModelo = require('../validators/modelValidator');
const logger = require('./../utils/logger');

class BaseController {
  constructor(service) {
    this.service = service;
  }

  create = async (req, res) => {
    try {
      const result = await this.service.create(req.body, req.file || null);
      res.status(201).json(result);
    } catch (err) {
      logger.error({ err }, 'Error al crear registro');
      res.status(400).json({ error: "Error al crear registro" });
    }
  };

  findAll = async (req, res) => {
    try {
      const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;

      if (isPaginated) {
        const page = parseInt(req.query.page) || 1;
        const MAX_LIMIT = 100;
        const limit = Math.min(parseInt(req.query.limit) || 10, MAX_LIMIT);
        const offset = (page - 1) * limit;

        const result = await this.service.findAll(limit, offset);
        const total = await this.service.countAll();
        const totalPages = Math.ceil(total / limit);

        return res.json({
          data: result,
          pagination: {
            page: page,
            limit: limit,
            total: total,
            totalPages: totalPages,
          },
        });
      } else {
        const result = await this.service.findAllWithoutPagination();
        return res.json(result);
      }
    } catch (err) {
      logger.error({ err }, 'Error al consultar todos los registros');
      res.status(500).json({ error: 'Error al consultar todos los registros' });
    }
  };

  findById = async (req, res) => {
    try {
      const result = await this.service.findById(req.params.id);
      if (!result) return res.status(404).json({ error: 'No encontrado' });
      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Error al consultar registro por ID');
      res.status(500).json({ error: 'Error al consultar registro por ID' });
    }
  };

  update = async (req, res) => {
    try {
      validarCamposModelo(this.service.model, req.body);
      const result = await this.service.update(req.params.id, req.body, req.file || null);
      if (!result) return res.status(404).json({ error: 'No encontrado' });
      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Error al actualizar registro');
      res.status(500).json({ error: 'Error al actualizar registro' });
    }
  };

  delete = async (req, res) => {
    try {
      const success = await this.service.delete(req.params.id);
      if (!success) return res.status(404).json({ error: 'No encontrado' });
      res.status(204).send();
    } catch (err) {
      logger.error({ err }, 'Error al eliminar registro');
      if (err.name === 'BadRequestError' || err.message.includes('No se puede eliminar')) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: 'Error al eliminar registro' });
    }
  };

  findByField = async (req, res) => {
    const { campo, valor } = req.body;

    if (!campo || valor === undefined) {
      return res.status(400).json({ error: "Se requiere 'campo' y 'valor'" });
    }

    try {
      const result = await this.service.findByField(campo, valor);
      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Error al buscar por campo');
      res.status(400).json({ error: 'Error al buscar por campo' });
    }
  };

  updateFields = async (req, res) => {
    const fields = req.body;
    try {
      const result =  await this.service.updateFields(req.params.id, fields, req.file || null);
      if (!result) return res.status(404).json({ error: 'No encontrado' });
      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Error al actualizar campos');
      res.status(400).json({ error: 'Error al actualizar campos' });
    }
  };

  // Métodos para el ownershipConfig 
  findAllMine = async (req, res) => {
    try {
      const userId = req.user.id;
      const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;

      if (isPaginated) {
        const page = parseInt(req.query.page) || 1;
        const MAX_LIMIT = 100;
        const limit = Math.min(parseInt(req.query.limit) || 10, MAX_LIMIT);
        const offset = (page - 1) * limit;

        const result = await this.service.findAllMine(userId, limit, offset);
        const total = await this.service.countMine(userId);
        const totalPages = Math.ceil(total / limit);

        return res.json({
          data: result,
          pagination: {
            page: page,
            limit: limit,
            total: total,
            totalPages: totalPages,
          },
        });
      }

      const result = await this.service.findAllMine(userId);
      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Error al consultar registros del usuario');
      res.status(500).json({ error: 'Error al consultar registros del usuario' });
    }
  };

  findMineById = async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await this.service.findMineById(id, userId);
      res.json(result);

    } catch (err) {
      logger.error({ err }, 'Error al consultar registro del usuario por ID');
      if (err.name === 'BadRequestError') return res.status(400).json({ error: err.message });
      if (err.name === 'OwnershipError') return res.status(403).json({ error: 'Error de pertenencia' });
      if (err.name === 'NotFoundError') return res.status(404).json({ error: 'Registro no encontrado' });
      return res.status(500).json({ error: 'Error al consultar registro del usuario por ID' });
    }
  };

  createMine = async (req, res) => {
    try {
      validarCamposModelo(this.service.model, req.body);
      const userId = req.user.id;
      const result = await this.service.createMine(req.body, userId);

      return res.status(201).json(result);
    } catch (err) {
      logger.error({ err }, 'Error al crear registro del usuario');
      if (err.name === 'BadRequestError') return res.status(400).json({ error: err.message });
      if (err.name === 'OwnershipError') return res.status(403).json({ error: 'Error de pertenencia' });
      if (err.name === 'NotFoundError') return res.status(404).json({ error: 'Registro no encontrado' });
      return res.status(500).json({ error: 'Error al crear registro del usuario' });
    }
  };

  findAllMineByField = async (req, res) => {
    try {
      const userId = req.user.id;
      const { campo, valor } = req.body;
      if (!campo || valor === undefined) {
        return res.status(400).json({ error: "Se requiere 'campo' y 'valor'" });
      }

      const result = await this.service.findAllMineByField(campo, valor, userId);
      return res.json(result);
    } catch (err) {
      logger.error({ err }, 'Error al buscar por campo en registros del usuario');
      if (err.name === 'BadRequestError') return res.status(400).json({ error: err.message });
      if (err.name === 'OwnershipError') return res.status(403).json({ error: 'Error de pertenencia' });
      return res.status(500).json({ error: 'Error al buscar por campo en registros del usuario' });
    }
  };

  updateMine = async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await this.service.updateMine(id, req.body, userId);
      return res.json(result);
    } catch (err) {
      logger.error({ err }, 'Error al actualizar registro del usuario');
      if (err.name === 'BadRequestError') return res.status(400).json({ error: err.message });
      if (err.name === 'OwnershipError') return res.status(403).json({ error: 'Error de pertenencia' });
      if (err.name === 'NotFoundError') return res.status(404).json({ error: 'Registro no encontrado' });
      return res.status(500).json({ error: 'Error al actualizar registro del usuario' });
    }
  };

  updateAllMineFields = async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const fields = req.body;
      const result = await this.service.updateAllMineFields(id, fields, userId);
      if (!result) return res.status(404).json({ error: 'No encontrado' });
      res.json(result);
    } catch (err) {
      logger.error({ err }, 'Error al actualizar campos del registro del usuario');
      if (err.name === 'BadRequestError') return res.status(400).json({ error: err.message });
      if (err.name === 'OwnershipError') return res.status(403).json({ error: 'Error de pertenencia' });
      if (err.name === 'NotFoundError') return res.status(404).json({ error: 'Registro no encontrado' });
      return res.status(500).json({ error: 'Error al actualizar campos del registro del usuario' });
    }
  };  

  deleteMine = async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const success = await this.service.deleteMine(id, userId);
      if (success) return res.status(204).send();
      return res.status(500).json({ error: 'No se pudo eliminar'});
    } catch (err) {
      logger.error({ err }, 'Error al eliminar registro del usuario');
      if (err.name === 'OwnershipError') return res.status(403).json({ error: 'Error de pertenencia' });
      if (err.name === 'NotFoundError') return res.status(404).json({ error: 'Registro no encontrado' });
      return res.status(500).json({ error: 'Error al eliminar registro del usuario' });
    }
  };

}

module.exports = BaseController;