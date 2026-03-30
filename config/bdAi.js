const mysql = require("mysql2/promise");
const pg = require("pg");
const dotenv = require("dotenv");
const logger = require('./../utils/logger');

dotenv.config({ quiet: true });

const dbType = String(process.env.DB_TYPE || "").trim().toLowerCase();

function createPool(user, password) {
  if (dbType === "mysql") {
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
  } else if (dbType === "postgres") {
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
    throw new Error("DB_TYPE en .env debe ser 'mysql' o 'postgres'");
  }
}

let adminPool;
let publicPool;

try {
  adminPool = createPool(process.env.DB_IA_ADMIN_USERNAME, process.env.DB_IA_ADMIN_PASSWORD);
  logger.info(`Pool creado a ${dbType} (Admin)`);
  
  publicPool = createPool(process.env.DB_IA_PUBLIC_USERNAME, process.env.DB_IA_PUBLIC_PASSWORD);
  logger.info(`Pool creado a ${dbType} (Public)`);
} catch (err) {
  logger.error({ err }, `Error al configurar las bases de datos`);
  process.exit(1);
}

async function testConnection(pool, name) {
  try {
    await pool.query("SELECT 1");
    logger.info(`Conexión REAL exitosa (${name})`);
  } catch (err) {
    logger.error({ err }, `Error real de conexión (${name})`);
  }
}

(async () => {
  await testConnection(adminPool, "Admin");
  await testConnection(publicPool, "Public");
})();

module.exports = { adminPool, publicPool, dbType };
