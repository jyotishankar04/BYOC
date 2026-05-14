import pino from 'pino';
import env from '../../config/env';

const logger = pino({
  level: env.LOG_LEVEL || 'info',
  ...(env.LOG_PRETTY && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
  base: {
    env: env.NODE_ENV,
    service: 'bringbucket-server',
  },
});

export default logger;
