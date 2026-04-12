const OwnershipError = require('../validators/ownershipError');
const NotFoundError = require('../validators/notFoundError');
const BadRequestError = require('../validators/badRequestError');

class BaseService {
  constructor(model, ownershipConfig = null, models = {}) {
    this.model = model;
    this.ownershipConfig = ownershipConfig;
    this.models = models;
  }

  sanitize(data, fields = null) {
    const allowed = fields || this.allowedFields;
    const sanitized = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        sanitized[key] = data[key];
      }
    }
    return sanitized;
  }

  async create(data, file = null) {
    const sanitizedData = this.sanitize(data);
    return await this.model.create(sanitizedData);
  }

  async findAll(limit, offset) {
    return await this.model.findAll({
      limit: limit,
      offset: offset,
    });
  }

  async findAllWithoutPagination() {
    return await this.model.findAll();
  }

  async countAll() {
    return await this.model.count();
  }

  async findById(id) {
    return await this.model.findByPk(id);
  }

  async update(id, data, file = null) {
    const instance = await this.findById(id);
    if (!instance) return null;

    const allowed = this.allowedUpdateFields?.length
      ? this.allowedUpdateFields
      : this.allowedFields;

    const sanitizedData = this.sanitize(data, allowed);

    if (Object.keys(sanitizedData).length !== Object.keys(data).length) {
      throw new BadRequestError('Campos no permitidos en la solicitud');
    }

    return await instance.update(sanitizedData);
  }

  async delete(id) {
    const instance = await this.findById(id);
    if (!instance) return null;
    await instance.destroy();
    return true;
  }

  async findByField(campo, valor) {
    if (!(campo in this.model.rawAttributes)) {
      throw new Error(`El campo '${campo}' no es válido.`);
    }
    if (!this.allowedFields.includes(campo)) {
      throw new Error(`No tiene permiso para modificar el campo '${campo}'.`);
    }

    return await this.model.findAll({
      where: {
        [campo]: valor,
      },
    });
  }

  async updateFields(id, fields = {}, file = null) {
    const instancia = await this.findById(id);
    if (!instancia) return null;

    const allowed = this.allowedUpdateFields?.length
      ? this.allowedUpdateFields
      : this.allowedFields;

    for (const key of Object.keys(fields)) {
      if (!allowed.includes(key)) {
        throw new Error(`No tienes permiso para modificar el campo '${key}'.`);
      }

      if (!(key in this.model.rawAttributes)) {
        throw new Error(`El campo '${key}' no es válido.`);
      }
    }

    for (const key of Object.keys(fields)) {
      instancia[key] = fields[key];
    }

    return await instancia.save();
  }

  // Métodos para el ownership
  buildOwnershipQuery(userId) {
    if (!this.ownershipConfig) return {};

    const cfg = this.ownershipConfig;

    switch (cfg.type) {
      case 'direct':
        return {
          where: {
            [cfg.field]: userId,
          },
        };
      case 'join':
        const relatedModel = this.models[cfg.include.model];
        if (!relatedModel) {
          throw new Error('Modelo relacionado no encontrado');
        }
        return {
          include: [
            {
              model: relatedModel,
              where: {
                [cfg.include.whereField]: userId,
              },
              required: true,
            },
          ],
        };
      default:
        throw new Error('Configuración de ownership inválida');
    }
  }

  async findAllMine(userId, limit, offset) {
    const ownershipQuery = this.buildOwnershipQuery(userId);
    const query = {
      ...(ownershipQuery.where ? { where: ownershipQuery.where } : {}),
      ...(ownershipQuery.include ? { include: ownershipQuery.include } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(offset !== undefined ? { offset } : {}),
    };
    return await this.model.findAll(query);
  }

  async countMine(userId) {
    const ownershipQuery = this.buildOwnershipQuery(userId);
    const query = {
      ...(ownershipQuery.where ? { where: ownershipQuery.where } : {}),
      ...(ownershipQuery.include ? { include: ownershipQuery.include } : {}),
      distinct: true,
      col: this.model.primaryKeyAttribute,
    };
    return await this.model.count(query);
  }

  async findMineById(id, userId) {
    const pkField = this.model.primaryKeyAttribute;
    const ownershipQuery = this.buildOwnershipQuery(userId);
    const owned = await this.model.findOne({
      where: { [pkField]: id, ...(ownershipQuery.where || {}) },
      ...(ownershipQuery.include ? { include: ownershipQuery.include } : {}),
    });

    if (owned) {
      return owned;
    }

    const exists = await this.model.findByPk(id);
    if (!exists) throw new NotFoundError();
    throw new OwnershipError();
  }

  async createMine(data, userId) {
    if (!this.ownershipConfig) {
      throw new Error('Ownership no definido para este modelo');
    }

    const cfg = this.ownershipConfig;

    const sanitized = this.sanitize(
      data,
      this.allowedFields
    );

    if (cfg.type === 'direct') {
      const ownerField = cfg.field;

      if (sanitized[ownerField] === undefined) {
        throw new BadRequestError(`El campo '${ownerField}' es obligatorio`);
      }

      if (sanitized[ownerField] !== userId) {
        throw new OwnershipError(
          'El campo propietario no coincide con el usuario autenticado'
        );
      }

      return await this.model.create(sanitized);
    }

    if (cfg.type === 'join') {
      if (!cfg.create || !cfg.create.foreignKey) {
        throw new Error(
          'ownershipConfig.create.foreignKey requerido para tipo "join"'
        );
      }

      const foreignKey = cfg.create.foreignKey;
      const relatedModelName = cfg.include.model;
      const whereField = cfg.include.whereField;
      const relatedModel = this.models[relatedModelName];
      if (!relatedModel) {
        throw new Error('Modelo relacionado no encontrado en models');
      }

      const relatedId = sanitized[foreignKey];

      if (relatedId === undefined || relatedId === null) {
        throw new BadRequestError(`Se requiere '${foreignKey}' en el body`);
      }
      const related = await relatedModel.findOne({
        where: {
          [relatedModel.primaryKeyAttribute]: relatedId,
          [whereField]: userId,
        },
      });

      if (!related) {
        const exists = await relatedModel.findByPk(relatedId);
        if (!exists) {
          throw new NotFoundError(`${relatedModelName} no existe`);
        }
        throw new OwnershipError(
          `El ${relatedModelName} no pertenece al usuario`
        );
      }

      return await this.model.create(sanitized);
    }

    throw new Error('Configuración de ownership inválida');
  }

  async findAllMineByField(field, value, userId) {
    if (!(field in this.model.rawAttributes)) {
      throw new Error(`El campo '${field}' no es válido.`);
    }
    const ownershipQuery = this.buildOwnershipQuery(userId);
    const where = {
      [field]: value,
      ...(ownershipQuery.where || {})
    };
    const query = {
      where,
      ...(ownershipQuery.include ? { include: ownershipQuery.include } : {})
    };

    return await this.model.findAll(query);
  }

  async updateMine(id, data, userId) {
    if (!this.ownershipConfig) {
      throw new Error('Ownership no definido para este modelo');
    }

    const cfg = this.ownershipConfig;
    const pkField = this.model.primaryKeyAttribute;

    const allowed = this.allowedUpdateFields?.length
      ? this.allowedUpdateFields
      : this.allowedFields;

    const sanitized = this.sanitize(data, allowed);

    if (Object.keys(sanitized).length !== Object.keys(data).length) {
      throw new OwnershipError('Se intentaron modificar campos no permitidos');
    }

    if (cfg.type === 'direct') {
      const ownerField = cfg.field;

      if (sanitized[ownerField] !== undefined) {
        throw new OwnershipError('No puedes cambiar el propietario del recurso');
      }

      const [affected] = await this.model.update(sanitized, {
        where: {
          [pkField]: id,
          [ownerField]: userId
        },
      });

      if (affected > 0) {
        return await this.model.findByPk(id);
      }

      const exists = await this.model.findByPk(id);
      if (!exists) throw new NotFoundError();
      throw new OwnershipError();
    }

    if (cfg.type === 'join') {
      const ownershipQuery = this.buildOwnershipQuery(userId);
      const instance = await this.model.findOne({
        where: { [pkField]: id, ...(ownershipQuery.where || {}) },
        ...(ownershipQuery.include ? { include: ownershipQuery.include } : {}),
      });

      if (instance) {
        if (
          cfg.create &&
          cfg.create.foreignKey &&
          sanitized[cfg.create.foreignKey] !== undefined
        ) {
          const relatedModel = this.models[cfg.include.model];
          const newRelatedId = sanitized[cfg.create.foreignKey];

          const related = await relatedModel.findOne({
            where: {
              [relatedModel.primaryKeyAttribute]: newRelatedId,
              [cfg.include.whereField]: userId
            },
          });

          if (!related) {
            const existsRelated = await relatedModel.findByPk(newRelatedId);

            if (!existsRelated) {
              throw new NotFoundError(`${cfg.include.model} no existe`);
            }

            throw new OwnershipError(
              `${cfg.include.model} no pertenece al usuario`
            );
          }
        }

        await instance.update(sanitized);
        return instance;
      }

      const exists = await this.model.findByPk(id);
      if (!exists) throw new NotFoundError();
      throw new OwnershipError();
    }

    throw new Error('Configuración de ownership inválida');
  }

  async updateAllMineFields(id, fields, userId) {
    if (!this.ownershipConfig) {
      throw new Error('Ownership no definido para este modelo');
    }

    const cfg = this.ownershipConfig;
    const pkField = this.model.primaryKeyAttribute;

    const allowed = this.allowedUpdateFields?.length
      ? this.allowedUpdateFields
      : this.allowedFields;

    const sanitized = this.sanitize(fields, allowed);

    if (Object.keys(sanitized).length !== Object.keys(fields).length) {
      throw new BadRequestError('Campos no permitidos en la solicitud');
    }

    if (cfg.type === 'direct') {
      const ownerField = cfg.field;

      if (sanitized[ownerField] !== undefined) {
        throw new OwnershipError('No puedes cambiar el propietario del recurso');
      }

      const [affected] = await this.model.update(sanitized, {
        where: {
          [pkField]: id,
          [ownerField]: userId
        },
      });

      if (affected > 0) {
        return await this.model.findByPk(id);
      }

      const exists = await this.model.findByPk(id);
      if (!exists) throw new NotFoundError();
      throw new OwnershipError();
    }

    if (cfg.type === 'join') {
      const ownershipQuery = this.buildOwnershipQuery(userId);

      const instance = await this.model.findOne({
        where: { [pkField]: id, ...(ownershipQuery.where || {}) },
        ...(ownershipQuery.include ? { include: ownershipQuery.include } : {}),
      });

      if (instance) {
        if (
          cfg.create &&
          cfg.create.foreignKey &&
          sanitized[cfg.create.foreignKey] !== undefined
        ) {
          const relatedModel = this.models[cfg.include.model];
          const newRelatedId = sanitized[cfg.create.foreignKey];

          const related = await relatedModel.findOne({
            where: {
              [relatedModel.primaryKeyAttribute]: newRelatedId,
              [cfg.include.whereField]: userId
            },
          });

          if (!related) {
            const existsRelated = await relatedModel.findByPk(newRelatedId);

            if (!existsRelated) {
              throw new NotFoundError(`${cfg.include.model} no existe`);
            }

            throw new OwnershipError(
              `${cfg.include.model} no pertenece al usuario`
            );
          }
        }

        await instance.update(sanitized);
        return instance;
      }

      const exists = await this.model.findByPk(id);
      if (!exists) throw new NotFoundError();
      throw new OwnershipError();
    }

    throw new Error('Configuración de ownership inválida');
  }

  async deleteMine(id, userId) {
    if (!this.ownershipConfig) {
      throw new Error('Ownership no definido para este modelo');
    }

    const cfg = this.ownershipConfig;
    const pkField = this.model.primaryKeyAttribute;

    if (cfg.type === 'direct') {
      const ownerField = cfg.field;
      const affected = await this.model.destroy({
        where: {
          [pkField]: id,
          [ownerField]: userId
        },
      });

      if (affected > 0) return true;

      const exists = await this.model.findByPk(id);
      if (!exists) throw new NotFoundError();
      throw new OwnershipError();
    }

    if (cfg.type === 'join') {
      const ownershipQuery = this.buildOwnershipQuery(userId);
      const instance = await this.model.findOne({
        where: { [pkField]: id, ...(ownershipQuery.where || {}) },
        ...(ownershipQuery.include ? { include: ownershipQuery.include } : {}),
      });

      if (instance) {
        await instance.destroy();
        return true;
      }

      const exists = await this.model.findByPk(id);
      if (!exists) throw new NotFoundError();
      throw new OwnershipError();
    }

    throw new Error('Configuración de ownership inválida');
  }

}

module.exports = BaseService;