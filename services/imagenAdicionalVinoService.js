const BaseService = require('./BaseService');
const { ImagenAdicionalVino, sequelize } = require('../models');
const storageService = require('./storageService');
const { Op } = require('sequelize');
const NotFoundError = require('../validators/notFoundError');
const validarCamposModelo = require('../validators/modelValidator');
const logger = require('./../utils/logger');

class ImagenAdicionalVinoService extends BaseService {
  constructor() {
    super(ImagenAdicionalVino);
    this.allowedFields = [
      'id_vino',
      'url_img'
    ];
    this.allowedUpdateFields = [
      'url_img'
    ];
  }

  async _isKeyReferencedElsewhere(oldKeyOrUrl, idExcluded = null) {
    if (!oldKeyOrUrl) return false;
    const oldKey = storageService.extractKey(oldKeyOrUrl);
    if (!oldKey) return false;

    const candidateValues = [
      oldKey,
      `${process.env.R2_PUBLIC_URL}/${oldKey}`,
    ];

    const where = {
      id_imagen: { [Op.ne]: idExcluded || 0 },
      url_img: { [Op.or]: candidateValues }
    };

    const count = await this.model.count({ where });
    return count > 0;
  }

  async _resolveImage(data, file, previousUrl = null, id_imagen = null) {
    if (file) {
      const uploadedUrl = await storageService.upload(file, 'vinos');
      if (previousUrl) {
        const usedElsewhere = await this._isKeyReferencedElsewhere(previousUrl, id_imagen);
        if (!usedElsewhere) {
          await storageService.delete(previousUrl);
        }
      }
      return uploadedUrl;
    }

    const maybeKey = data.url_img;
    if (maybeKey && typeof maybeKey === 'string' && !maybeKey.startsWith('http')) {
      return `${process.env.R2_PUBLIC_URL}/${maybeKey}`;
    }

    if (maybeKey && maybeKey.startsWith('http')) return maybeKey;

    return previousUrl || null;
  }

  async create(data, file = null) {
    const t = await sequelize.transaction();
    let uploadedUrl = null;
    try {
      validarCamposModelo(this.model, data, file ? ['url_img'] : []);

      if (file) {
        uploadedUrl = await storageService.upload(file, 'vinosadicionales');
        data.url_img = uploadedUrl;
      } else if (data.url_img && !data.url_img.startsWith('http')) {
        data.url_img = `${process.env.R2_PUBLIC_URL}/${data.url_img}`;
      }

      if (this.model.rawAttributes.url_img?.allowNull === false && !data.url_img) {
        throw new Error("El campo 'url_img' es obligatorio.");
      }

      const result = await this.model.create(data, { transaction: t });

      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      if (uploadedUrl) {
        try { await storageService.delete(uploadedUrl); } catch (e) { logger.error({ err: e, url: uploadedUrl }, 'Error al eliminar imagen subida'); }
      }
      throw err;
    }
  }

  async updateFields(id, fields = {}, file = null) {
    const imgVino = await this.model.findByPk(id);
    if (!imgVino) throw new NotFoundError('Vino no encontrado');

    const newUrl = await this._resolveImage(fields, file, imgVino.url_img, imgVino.id_imagen);

    Object.keys(fields).forEach(key => {
      if (key in this.model.rawAttributes) {
        imgVino[key] = fields[key];
      }
    });

    imgVino.url_img = newUrl;

    return await imgVino.save();
  }

  async delete(id) {
    const t = await sequelize.transaction();

    try {
      const imagen = await this.model.findByPk(id, { transaction: t });
      if (!imagen) throw new NotFoundError('Imagen adicional no encontrada');

      let urlToDelete = null;

      const usedElsewhere = await this._isKeyReferencedElsewhere(
        imagen.url_img,
        id
      );

      if (!usedElsewhere && imagen.url_img) {
        urlToDelete = imagen.url_img;
      }

      await imagen.destroy({ transaction: t });

      await t.commit();

      if (urlToDelete) {
        try {
          await storageService.delete(urlToDelete);
        } catch (err) {
          logger.error({ err, url: urlToDelete }, 'Error eliminando imagen en storage');
        }
      }

      return { message: 'Imagen eliminada correctamente' };

    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = new ImagenAdicionalVinoService();