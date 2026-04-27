const mysql = require('mysql2/promise');
const pg = require('pg');
const logger = require('./../utils/logger');

const dbType = String(process.env.DB_TYPE || '').trim().toLowerCase();

function createPool(user, password) {
  if (dbType === 'mysql') {
    return mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: user,
      password: password,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  } else if (dbType === 'postgres') {
    const { Pool } = pg;
    return new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: user,
      password: password,
      database: process.env.DB_NAME,
      max: 10,
      ssl: { rejectUnauthorized: false }
    });
  } else {
    throw new Error(`DB_TYPE en .env debe ser 'mysql' o 'postgres'`);
  }
}

let adminPool;
let publicPool;

async function initPools() {
  try {
    adminPool = createPool(process.env.DB_IA_ADMIN_USERNAME, process.env.DB_IA_ADMIN_PASSWORD);
    publicPool = createPool(process.env.DB_IA_PUBLIC_USERNAME, process.env.DB_IA_PUBLIC_PASSWORD);

    if (process.env.NODE_ENV !== 'test') {
      await testConnection(adminPool, 'Admin');
      await testConnection(publicPool, 'Public');
    }

    return { adminPool, publicPool };
  } catch (err) {
    logger.error({ err }, `Error al crear los pools`);
    throw err;
  }
}

async function testConnection(pool, name) {
  try {
    await pool.query('SELECT 1');
    logger.info(`Conexión REAL exitosa (${name})`);
  } catch (err) {
    logger.error({ err }, `Error real de conexión (${name})`);
  }
}

function getAdminPool() {
  if (!adminPool) throw new Error('adminPool no inicializado');
  return adminPool;
}

function getPublicPool() {
  if (!publicPool) throw new Error('publicPool no inicializado');
  return publicPool;
}

module.exports = { getAdminPool, getPublicPool, dbType, initPools };
