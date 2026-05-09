import app from '@/app';
import logger from '@/core/logger';
import env from '@/config/env';

const PORT = parseInt(env.PORT || '3000', 10);

const server = app.listen(PORT, () => {
  logger.info({ port: PORT, environment: env.NODE_ENV, pid: process.pid }, 'Server started');
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default server;
