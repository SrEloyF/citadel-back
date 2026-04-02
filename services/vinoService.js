const BaseService = require('./BaseService');
const { Vino, ImagenAdicionalVino, sequelize } = require('../models');
const storageService = require('./storageService');
const { Op } = require('sequelize');
const NotFoundError = require('../validators/notFoundError');
const validarCamposModelo = require('../validators/modelValidator');
const logger = require('./../utils/logger');

class VinoService extends BaseService {
  constructor() {
    super(Vino);
    this.allowedFields = [
      'sku',
      'id_sabor',
      'id_dulzor',
      'id_presentacion',
      'nombre',
      'descripcion',
      'stock',
      'url_img_principal'
    ];
    this.allowedUpdateFields = [
      'sku',
      'id_sabor',
      'id_dulzor',
      'id_presentacion',
      'nombre',
      'descripcion',
      'stock',
      'url_img_principal'
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
      id_vino: { [Op.ne]: idExcluded || 0 },
      url_img_principal: { [Op.or]: candidateValues }
    };

    const count = await this.model.count({ where });
    return count > 0;
  }

  async _resolveImage(data, file, previousUrl = null, id_vino = null) {
    if (file) {
      const uploadedUrl = await storageService.upload(file, 'vinos');
      if (previousUrl) {
        const usedElsewhere = await this._isKeyReferencedElsewhere(previousUrl, id_vino);
        if (!usedElsewhere) {
          await storageService.delete(previousUrl);
        }
      }
      return uploadedUrl;
    }

    const maybeKey = data.url_img_principal;
    if (maybeKey && typeof maybeKey === 'string' && !maybeKey.startsWith('http')) {
      return `${process.env.R2_PUBLIC_URL}/${maybeKey}`;
    }

    if (maybeKey && maybeKey.startsWith('http')) return maybeKey;

    return previousUrl || null;
  }

  async create(data, file = null) {
    const t = await sequelize.transaction();
    let uploadedUrl = null;

    const cleanData = this.sanitize(data);

    try {
      if (file) {
        uploadedUrl = await storageService.upload(file, 'vinos');
        cleanData.url_img_principal = uploadedUrl;
      } else if (
        cleanData.url_img_principal &&
        !cleanData.url_img_principal.startsWith('http')
      ) {
        cleanData.url_img_principal = `${process.env.R2_PUBLIC_URL}/${cleanData.url_img_principal}`;
      }

      validarCamposModelo(this.model, cleanData);

      const result = await this.model.create(cleanData, { transaction: t });

      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();

      if (uploadedUrl) {
        try {
          await storageService.delete(uploadedUrl);
        } catch (e) {
          logger.error(
            { err: e, url: uploadedUrl },
            'Error al eliminar imagen subida'
          );
        }
      }

      throw err;
    }
  }

  async updateFields(id, fields = {}, file = null) {
    const vino = await this.model.findByPk(id);
    if (!vino) throw new NotFoundError('Vino no encontrado');

    const newUrl = await this._resolveImage(fields, file, vino.url_img_principal, vino.id_vino);

    const allowed = this.allowedUpdateFields || this.allowedFields;
    const cleanFields = this.sanitize(fields);

    Object.keys(cleanFields).forEach(key => {
      if (allowed.includes(key)) {
        vino[key] = cleanFields[key];
      }
    });

    vino.url_img_principal = newUrl;

    return await vino.save();
  }

  async delete(id) {
    const t = await sequelize.transaction();

    try {
      const vino = await this.model.findByPk(id, { transaction: t });
      if (!vino) throw new NotFoundError('Vino no encontrado');

      const imagenes = await ImagenAdicionalVino.findAll({
        where: { id_vino: id },
        transaction: t
      });

      const urlsToDelete = [];

      const usedElsewherePrincipal = await this._isKeyReferencedElsewhere(
        vino.url_img_principal,
        id
      );

      if (!usedElsewherePrincipal && vino.url_img_principal) {
        urlsToDelete.push(vino.url_img_principal);
      }

      for (const img of imagenes) {
        const usedElsewhere = await this._isKeyReferencedElsewhere(
          img.url_img,
          img.id_imagen
        );

        if (!usedElsewhere && img.url_img) {
          urlsToDelete.push(img.url_img);
        }
      }

      await ImagenAdicionalVino.destroy({
        where: { id_vino: id },
        transaction: t
      });

      await vino.destroy({ transaction: t });

      await t.commit();

      for (const url of urlsToDelete) {
        try {
          await storageService.delete(url);
        } catch (err) {
          logger.error({ err, url }, 'Error eliminando imagen en storage');
        }
      }

      return { message: 'Vino eliminado correctamente' };

    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = new VinoService();
