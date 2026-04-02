const BaseController = require('./BaseController');
const VinoService = require('../services/vinoService');
const { Dulzor, Sabor, Presentacion, Precio, ImagenAdicionalVino } = require('../models');

class VinoController extends BaseController {
  constructor() {
    super(VinoService);
  }

  findAll = async (req, res) => {
    try {
      const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;

      const include = [
        { model: Dulzor },
        { model: Sabor },
        { model: Presentacion },
        { model: Precio },
        { model: ImagenAdicionalVino }
      ];

      if (isPaginated) {
        const page = parseInt(req.query.page) || 1;
        const MAX_LIMIT = 100;
        const limit = Math.min(parseInt(req.query.limit) || 10, MAX_LIMIT);
        const offset = (page - 1) * limit;

        const result = await this.service.model.findAndCountAll({
          include,
          limit,
          offset
        });

        return res.json({
          data: result.rows,
          pagination: {
            page,
            limit,
            total: result.count,
            totalPages: Math.ceil(result.count / limit),
          },
        });
      } else {
        const result = await this.service.model.findAll({
          include
        });

        return res.json(result);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al consultar vinos' });
    }
  };

  findById = async (req, res) => {
    try {
      const include = [
        { model: Dulzor },
        { model: Sabor },
        { model: Presentacion },
        { model: Precio },
        { model: ImagenAdicionalVino }
      ];

      const result = await this.service.model.findByPk(req.params.id, {
        include
      });

      if (!result) {
        return res.status(404).json({ error: 'No encontrado' });
      }

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al consultar vino por ID' });
    }
  };

  findByField = async (req, res) => {
    const { campo, valor } = req.body;

    if (!campo || valor === undefined) {
      return res.status(400).json({ error: "Se requiere 'campo' y 'valor'" });
    }

    try {
      const include = [
        { model: Dulzor },
        { model: Sabor },
        { model: Presentacion },
        { model: Precio },
        { model: ImagenAdicionalVino }
      ];

      const result = await this.service.model.findAll({
        where: {
          [campo]: valor
        },
        include
      });

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Error al buscar por campo' });
    }
  };
}

module.exports = new VinoController();