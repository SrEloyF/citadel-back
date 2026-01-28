class OwnershipError extends Error {
  constructor(message = 'Acceso no permitido al recurso') {
    super(message);
    this.name = 'OwnershipError';
    this.statusCode = 403;
  }
}

module.exports = OwnershipError;
