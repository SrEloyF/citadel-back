const BaseService = require('./BaseService');
const { Vino, ImagenAdicionalVino, sequelize } = require('../models');
const storageService = require('./storageService');
const { Op } = require('sequelize');
const NotFoundError = require('../validators/notFoundError');
const validarCamposModelo = require('../validators/modelValidator');

class VinoService extends BaseService {
  constructor() {
    super(Vino);
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
    try {
      if (file) {
        uploadedUrl = await storageService.upload(file, 'vinos');
        data.url_img_principal = uploadedUrl;
      } else if (data.url_img_principal && !data.url_img_principal.startsWith('http')) {
        data.url_img_principal = `${process.env.R2_PUBLIC_URL}/${data.url_img_principal}`;
      }

      validarCamposModelo(this.model, data);

      const result = await this.model.create(data, { transaction: t });

      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      if (uploadedUrl) {
        try { await storageService.delete(uploadedUrl); } catch (e) { console.error('Compensating delete failed:', e); }
      }
      throw err;
    }
  }

  async updateFields(id, fields = {}, file = null) {
    const vino = await this.model.findByPk(id);
    if (!vino) throw new NotFoundError('Vino no encontrado');

    const newUrl = await this._resolveImage(fields, file, vino.url_img_principal, vino.id_vino);

    Object.keys(fields).forEach(key => {
      if (key in this.model.rawAttributes) {
        vino[key] = fields[key];
      }
    });

    vino.url_img_principal = newUrl;

    return await vino.save();
  }

  async delete(id) {
    const vino = await this.model.findByPk(id);
    if (!vino) throw new NotFoundError('Vino no encontrado');

    const usedElsewhere = await this._isKeyReferencedElsewhere(vino.url_img_principal, id);
    if (!usedElsewhere && vino.url_img_principal) {
      await storageService.delete(vino.url_img_principal);
    }

    const imagenes = await ImagenAdicionalVino.findAll({
      where: { id_vino: id }
    });

    for (const img of imagenes) {
      const usedElsewhere = await this._isKeyReferencedElsewhere(img.url_img, img.id_imagen);

      if (!usedElsewhere && img.url_img) {
        await storageService.delete(img.url_img);
      }
    }

    return vino.destroy();
  }
}

module.exports = new VinoService();
