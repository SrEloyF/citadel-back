class BadRequestError extends Error {
  constructor(message = 'Solicitud no válida') {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}
module.exports = BadRequestError;