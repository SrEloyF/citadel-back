const validarCamposModelo = require('../validators/modelValidator');

class BaseController {
  constructor(service) {
    this.service = service;
  }

  create = async (req, res) => {
    try {
      validarCamposModelo(this.service.model, req.body);
      const result = await this.service.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({
        error: err.message,
        msg: err.name || undefined,
        original: err.original?.sqlMessage || undefined
      });
    }
  };

  findAll = async (req, res) => {
    try {
      const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;

      if (isPaginated) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
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
      res.status(500).json({ error: err.message });
    }
  };

  findById = async (req, res) => {
    try {
      const result = await this.service.findById(req.params.id);
      if (!result) return res.status(404).json({ error: 'No encontrado' });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  update = async (req, res) => {
    try {
      validarCamposModelo(this.service.model, req.body);
      const result = await this.service.update(req.params.id, req.body);
      if (!result) return res.status(404).json({ error: 'No encontrado' });
      res.json(result);
    } catch (err) {
      res.status(400).json({
        error: err.message,
        msg: err.name || undefined,
        original: err.original?.sqlMessage || undefined,
      });
    }
  };

  delete = async (req, res) => {
    try {
      const success = await this.service.delete(req.params.id);
      if (!success) return res.status(404).json({ error: 'No encontrado' });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  updateField = async (req, res) => {
    const { campo, valor } = req.body;

    if (!campo || valor === undefined) {
      return res.status(400).json({ error: "Se requiere 'campo' y 'valor'" });
    }

    try {
      const result = await this.service.updateField(req.params.id, campo, valor);
      if (!result) return res.status(404).json({ error: 'No encontrado' });
      res.json(result);
    } catch (err) {
      res.status(400).json({
        error: err.message,
        msg: err.name || undefined,
        original: err.original?.sqlMessage || undefined
      });
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
      res.status(400).json({ error: err.message });
    }
  };

  updateFields = async (req, res) => {
    const fields = req.body;
    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
      return res.status(400).json({ error: "Se requiere un objeto con los campos a actualizar" });
    }
    try {
      const result = await this.service.updateFields(req.params.id, fields);
      if (!result) return res.status(404).json({ error: 'No encontrado' });
      res.json(result);
    } catch (err) {
      res.status(400).json({
        error: err.message,
        msg: err.name || undefined,
        original: err.original?.sqlMessage || undefined
      });
    }
  };

  // Métodos para el ownershipConfig 
  findAllMine = async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await this.service.findAllMine(userId);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  findMineById = async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await this.service.findMineById(id, userId);
      res.json(result);

    } catch (err) {
      if (err.name === 'BadRequestError') return res.status(400).json({ error: err.message });
      if (err.name === 'NotFoundError') return res.status(404).json({ error: err.message });
      if (err.name === 'OwnershipError') return res.status(403).json({ error: err.message });
      return res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
    }
  };

  createMine = async (req, res) => {
    try {
      validarCamposModelo(this.service.model, req.body);
      const userId = req.user.id;
      const result = await this.service.createMine(req.body, userId);

      return res.status(201).json(result);
    } catch (err) {
      if (err.name === 'NotFoundError') return res.status(404).json({ error: err.message });
      if (err.name === 'OwnershipError') return res.status(403).json({ error: err.message });
      if (err.name === 'BadRequestError') return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
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
      if (err.name === 'OwnershipError') return res.status(403).json({ error: err.message });
      return res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
    }
  };

  updateMine = async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await this.service.updateMine(id, req.body, userId);
      return res.json(result);
    } catch (err) {
      if (err.name === 'NotFoundError') return res.status(404).json({ error: err.message });
      if (err.name === 'OwnershipError') return res.status(403).json({ error: err.message });
      if (err.name === 'BadRequestError') return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
    }
  };

  updateAllMineFields = async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const fields = req.body;
      if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
        return res.status(400).json({ error: "Se requiere un objeto con los campos a actualizar" });
      }
      const result = await this.service.updateAllMineFields(id, fields, userId);
      if (!result) return res.status(404).json({ error: 'No encontrado' });
      res.json(result);
    } catch (err) {
      if (err.name === 'NotFoundError') return res.status(404).json({ error: err.message });
      if (err.name === 'OwnershipError') return res.status(403).json({ error: err.message });
      if (err.name === 'BadRequestError') return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
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
      if (err.name === 'NotFoundError') return res.status(404).json({ error: err.message });
      if (err.name === 'OwnershipError') return res.status(403).json({ error: err.message });
      return res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
    }
  };

}

module.exports = BaseController;