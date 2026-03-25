const { Parser } = require('node-sql-parser');
const { dbType } = require('../config/bdAi');

const parser = new Parser();
const sqlDialect = dbType === "mysql" ? "mysql" : "postgresql";

const ADMIN_WHITE_LIST = new Set([
  'banners', 'usuarios', 'carritos', 'carritos_productos', 'vinos',
  'precios', 'pagos', 'imagenes_adicionales_vinos', 'sabores', 'presentaciones'
]);

const PUBLIC_WHITE_LIST = new Set([
  'vinos', 'precios', 'sabores', 'presentaciones'
]);

function checkFunctionsAndTables(node, whitelist) {
  if (!node || typeof node !== "object") return;
  
  if (node.type === "table" && node.table) {
    const tableName = String(node.table).toLowerCase();
    if (!whitelist.has(tableName)) {
      throw new Error(`Tabla no permitida: ${node.table}`);
    }
  }

  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(n => checkFunctionsAndTables(n, whitelist));
    else if (value && typeof value === 'object') checkFunctionsAndTables(value, whitelist);
  }
}

function sanitizeSqlQuery(q, isAdmin = false) {
  const query = String(q || "").trim().replace(/;+$/, "");
  if (!query) throw new Error("Consulta vacía");

  const whitelist = isAdmin ? ADMIN_WHITE_LIST : PUBLIC_WHITE_LIST;

  let ast;
  try {
    ast = parser.astify(query, { database: sqlDialect });
  } catch (e) {
    throw new Error(`SQL sintácticamente inválido: ${e.message}`);
  }

  if (Array.isArray(ast)) ast = ast[0];

  if (ast.type !== "select") throw new Error("Solo SELECT permitido");
  checkFunctionsAndTables(ast, whitelist);

  if (!ast.limit) {
    ast.limit = { seperator: "", value: [{ type: "number", value: 5 }] };
  }

  return parser.sqlify(ast, { database: sqlDialect });
}

module.exports = { sanitizeSqlQuery };
