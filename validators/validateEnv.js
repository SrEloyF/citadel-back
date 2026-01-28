function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`La variable de entorno ${name} es requerida`);
  }
  
  return value;
}

module.exports = requireEnv;
