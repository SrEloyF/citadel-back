const s3 = require('../config/r2');
const { URL } = require('url');
const { randomUUID } = require('crypto');
const logger = require('./../utils/logger');

function normalizeFilename(name = '') {
  const noTilde = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  return noTilde.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
}

class StorageService {

  constructor() {
    this.s3 = s3;
  }
  
  extractKey(value) {
    if (!value) return null;
    if (typeof value === 'string' && value.startsWith('http')) {
      const base = process.env.R2_PUBLIC_URL;
      if (base && value.includes(base)) {
        return value.replace(`${base}/`, '');
      }
      try {
        const u = new URL(value);
        return u.pathname.replace(/^\/+/, '');
      } catch (err) {
        logger.error({ err }, 'Error al extraer clave de URL');
        return null;
      }
    }
    return value;
  }

  async upload(file, folder = '') {
    if (!file) throw new Error('No se recibió archivo para upload');

    const original = file.originalname || `file_${Date.now()}`;
    const safe = normalizeFilename(original);
    const uuid = randomUUID();
    const filename = `${Date.now()}_${uuid}_${safe}`;
    const key = folder ? `${folder}/${filename}` : filename;

    const params = {
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype || 'application/octet-stream',
      ACL: 'public-read'
    };

    await s3.upload(params).promise();

    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }

  async delete(valueOrUrl) {
    const key = this.extractKey(valueOrUrl);
    if (!key) return;
    const params = { Bucket: process.env.R2_BUCKET, Key: key };
    try {
      await s3.deleteObject(params).promise();
    } catch (err) {
      logger.error({ err, key }, 'Error al eliminar objeto de R2');
      throw err;
    }
  }
}

module.exports = new StorageService();
