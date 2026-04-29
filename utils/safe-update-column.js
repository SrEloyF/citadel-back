const { logger } = require("sequelize/lib/utils/logger");

async function safeRemoveColumn(queryInterface, tableName, columnName) {
  try {
    await queryInterface.removeColumn(tableName, columnName);
  } catch (err) {
    const msg = (err.message || '').toLowerCase();
    const origMsg = err.original?.message ? err.original.message.toLowerCase() : '';
    const parentMsg = err.parent?.message ? err.parent.message.toLowerCase() : '';

    const isColumnMissing =
      msg.includes("can't drop column") && msg.includes("check that it exists") ||
      origMsg.includes("can't drop column") && origMsg.includes("check that it exists") ||
      parentMsg.includes("can't drop column") && parentMsg.includes("check that it exists") ||
      err.original?.errno === 1091 ||
      err.parent?.errno === 1091 ||
      msg.includes('er_cant_drop_field_or_key') ||
      msg.includes('key column') && msg.includes("doesn't exist") ||
      msg.includes('unknown column') ||

      msg.includes('column') && msg.includes('does not exist') ||
      msg.includes('column "') && msg.includes('" of relation') ||
      err.parent?.code === '42703' ||
      err.parent?.code === '42P01';

    if (isColumnMissing) {
      return;
    }

    logger.error({ err }, `Error al eliminar columna ${columnName} de ${tableName}`);
    throw err;
  }
}

async function safeAddColumn(queryInterface, tableName, columnName, attributes) {
  const table = await queryInterface.describeTable(tableName);

  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, attributes);
  } else {
    await queryInterface.changeColumn(tableName, columnName, attributes);
  }
}

async function safeAddIndex(queryInterface, tableName, fields, options = {}) {
  try {
    const indexes = await queryInterface.showIndex(tableName);

    const indexExists = indexes.some((idx) => {
      const idxFields = (idx.fields || []).map(f => f.attribute);
      const targetFields = Array.isArray(fields) ? fields : [fields];

      return (
        idxFields.length === targetFields.length &&
        idxFields.every((f, i) => f === targetFields[i])
      );
    });

    if (!indexExists) {
      await queryInterface.addIndex(tableName, fields, options);
    }
  } catch (err) {
    logger.error({ err }, `Error al añadir índice en ${tableName}`);
    throw err;
  }
}

async function safeRemoveIndex(queryInterface, tableName, indexName) {
  try {
    await queryInterface.removeIndex(tableName, indexName);
  } catch (err) {
    const msg = (err.message || '').toLowerCase();
    const origMsg = err.original?.message ? err.original.message.toLowerCase() : '';
    const parentMsg = err.parent?.message ? err.parent.message.toLowerCase() : '';

    const isIndexMissing =
      msg.includes('does not exist') ||
      msg.includes('not exist') ||
      msg.includes('unknown index') ||
      origMsg.includes('does not exist') ||
      parentMsg.includes('does not exist') ||
      err.parent?.code === '42704' ||
      err.parent?.errno === 1091;

    if (isIndexMissing) {
      return;
    }

    logger.error({ err }, `Error al eliminar índice ${indexName} de ${tableName}`);
    throw err;
  }
}

module.exports = {
  safeRemoveColumn,
  safeAddColumn,
  safeAddIndex,
  safeRemoveIndex,
};