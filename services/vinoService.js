const BaseService = require('./BaseService');
const { Vino, ImagenAdicionalVino, Precio, sequelize } = require('../models');
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
      'url_img_principal',
      'estado'
    ];
    this.allowedUpdateFields = [
      'sku',
      'id_sabor',
      'id_dulzor',
      'id_presentacion',
      'nombre',
      'descripcion',
      'stock',
      'url_img_principal',
      'estado'
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

  async _deleteUnusedImages(imagesToDelete) {
    for (const url of imagesToDelete) {
      try {
        const usedElsewhere = await this._isKeyReferencedElsewhere(url);
        if (!usedElsewhere) {
          await storageService.delete(url);
        }
      } catch (err) {
        logger.error({ err, url }, 'Error eliminando imagen de storage');
      }
    }
  }

  async create(data, files = null) {
    const t = await sequelize.transaction();
    const uploadedUrls = [];

    const cleanData = this.sanitize(data);

    try {
      const mainFile = files?.url_img_principal?.[0] || (files?.fieldname === 'url_img_principal' ? files : null);

      if (mainFile) {
        const uploadedUrl = await storageService.upload(mainFile, 'vinos');
        uploadedUrls.push(uploadedUrl);
        cleanData.url_img_principal = uploadedUrl;
      } else if (cleanData.url_img_principal && !cleanData.url_img_principal.startsWith('http')) {
        cleanData.url_img_principal = `${process.env.R2_PUBLIC_URL}/${cleanData.url_img_principal}`;
      }

      validarCamposModelo(this.model, cleanData);
      const result = await this.model.create(cleanData, { transaction: t });

      if (data.precios && Array.isArray(data.precios)) {
        for (const p of data.precios) {
          await Precio.create({ ...p, id_vino: result.id_vino }, { transaction: t });
        }
      }

      const additionalFiles = files?.imagen_adicionales || [];
      const bodyImages = Array.isArray(data.imagen_adicionales) ? data.imagen_adicionales : [];

      for (const img of bodyImages) {
        let url_img = img.url_img;
        if (url_img && !url_img.startsWith('http')) {
          url_img = `${process.env.R2_PUBLIC_URL}/${url_img}`;
        }
        await ImagenAdicionalVino.create({ url_img, id_vino: result.id_vino }, { transaction: t });
      }

      for (const file of additionalFiles) {
        const uploadedUrl = await storageService.upload(file, 'vinos');
        uploadedUrls.push(uploadedUrl);
        await ImagenAdicionalVino.create({ url_img: uploadedUrl, id_vino: result.id_vino }, { transaction: t });
      }

      await t.commit();
      return result;
    } catch (err) {
      await t.rollback();
      for (const url of uploadedUrls) {
        try { await storageService.delete(url); } catch (e) { logger.error({ err: e, url }, 'Error al revertir subida'); }
      }
      throw err;
    }
  }

  async update(id, data, files = null) {
    const t = await sequelize.transaction();
    const uploadedUrls = [];

    try {
      const vino = await this.model.findByPk(id, { transaction: t });
      if (!vino) throw new NotFoundError('Vino no encontrado');

      const cleanData = this.sanitize(data, this.allowedUpdateFields);

      const mainFile =
        files?.url_img_principal?.[0] ||
        (files?.fieldname === 'url_img_principal' ? files : null);

      if (mainFile) {
        const uploadedUrl = await storageService.upload(mainFile, 'vinos');
        uploadedUrls.push(uploadedUrl);
        cleanData.url_img_principal = uploadedUrl;

        const usedElsewhere = await this._isKeyReferencedElsewhere(
          vino.url_img_principal,
          vino.id_vino
        );

        if (!usedElsewhere && vino.url_img_principal) {
          await storageService.delete(vino.url_img_principal);
        }

      } else if (
        data.url_img_principal &&
        !data.url_img_principal.startsWith('http')
      ) {
        cleanData.url_img_principal =
          `${process.env.R2_PUBLIC_URL}/${data.url_img_principal}`;
      }

      await vino.update(cleanData, { transaction: t });

      if (data.precios !== undefined && Array.isArray(data.precios)) {
        await Precio.destroy({ where: { id_vino: id }, transaction: t });

        for (const p of data.precios) {
          await Precio.create(
            { ...p, id_vino: id },
            { transaction: t }
          );
        }
      }

      const additionalFiles = files?.imagen_adicionales || [];
      const rawImages = data.imagen_adicionales;

      const isSyncMode = typeof rawImages !== 'undefined';

      if (isSyncMode) {
        let bodyImages = [];

        try {
          bodyImages =
            typeof rawImages === 'string'
              ? JSON.parse(rawImages)
              : Array.isArray(rawImages)
                ? rawImages
                : [];
        } catch (err) {
          bodyImages = [];
        }

        const oldImages = await ImagenAdicionalVino.findAll({
          where: { id_vino: id },
          transaction: t
        });

        if (bodyImages.length === 0) {
          const allUrls = oldImages.map(img => img.url_img);

          await this._deleteUnusedImages(allUrls);

          await ImagenAdicionalVino.destroy({
            where: { id_vino: id },
            transaction: t
          });

        } else {
          const bodyUrls = bodyImages.map(img =>
            img.url_img.startsWith('http')
              ? img.url_img
              : `${process.env.R2_PUBLIC_URL}/${img.url_img}`
          );

          const imagesToDelete = oldImages
            .filter(img => !bodyUrls.includes(img.url_img))
            .map(img => img.url_img);

          await this._deleteUnusedImages(imagesToDelete);

          await ImagenAdicionalVino.destroy({
            where: { id_vino: id },
            transaction: t
          });

          for (const url of bodyUrls) {
            await ImagenAdicionalVino.create(
              { url_img: url, id_vino: id },
              { transaction: t }
            );
          }
        }
      }

      if (additionalFiles.length > 0) {
        for (const file of additionalFiles) {
          const uploadedUrl = await storageService.upload(file, 'vinos');
          uploadedUrls.push(uploadedUrl);

          await ImagenAdicionalVino.create(
            { url_img: uploadedUrl, id_vino: id },
            { transaction: t }
          );
        }
      }

      await t.commit();

      return await this.model.findByPk(id, {
        include: [Precio, ImagenAdicionalVino]
      });

    } catch (err) {
      await t.rollback();

      for (const url of uploadedUrls) {
        try {
          await storageService.delete(url);
        } catch (e) {
          logger.error(
            { err: e, url },
            'Error al revertir subida en update'
          );
        }
      }

      throw err;
    }
  }

  async updateFields(id, fields = {}, file = null) {
    return this.update(id, fields, file);
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

      await Precio.destroy({
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
