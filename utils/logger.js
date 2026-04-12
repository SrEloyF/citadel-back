const pino = require('pino');

const prettyEnvs = ['development', 'test'];

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(prettyEnvs.includes(process.env.NODE_ENV) && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});

module.exports = logger;