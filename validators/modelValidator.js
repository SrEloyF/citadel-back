function validarCamposModelo(model, body, skipFields = []) {

  if (!body || typeof body !== 'object') {
    throw new Error(
      'El body no es válido o no fue procesado. Verifica middleware (JSON o multer).'
    );
  }

  const atributos = model.rawAttributes;
  const errores = [];

  const timestampFields = [];
  if (model.options.timestamps) {
    if (model.options.createdAt !== false) timestampFields.push(model.options.createdAt || 'createdAt');
    if (model.options.updatedAt !== false) timestampFields.push(model.options.updatedAt || 'updatedAt');
  }

  for (const key in atributos) {
    if (skipFields.includes(key)) continue;
    if (timestampFields.includes(key)) continue;

    const atributo = atributos[key];

    if (atributo.autoIncrement || atributo.defaultValue !== undefined) continue;

    const requerido = atributo.allowNull === false;
    const valor = body[key];

    if (requerido && (valor === undefined || valor === null || valor === '')) {
      errores.push(`El campo '${key}' es obligatorio.`);
    }
  }

  if (errores.length > 0) {
    throw new Error(errores.join(' '));
  }
}

module.exports = validarCamposModelo;
