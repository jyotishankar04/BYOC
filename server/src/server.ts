import app from '@/app';
import logger from '@/core/logger';
import env from '@/config/env';
import { appSettings } from '@/config/app-settings';
import prisma from '@/config/db.config';
import redisClient from '@/config/redis.config';
import cacheClient from '@/config/cache.config';

const PORT = parseInt(env.PORT || '4000', 10);

appSettings.load().then(() => {
  logger.info({ betaMode: appSettings.getBetaModeSync() }, 'App settings loaded');
}).catch(() => {});

cacheClient.connect().then(() => {
  logger.info('Cache client connected');
}).catch((err) => {
  logger.error({ err }, 'Cache client failed to connect');
});

const server = app.listen(PORT, () => {
  logger.info({ port: PORT, environment: env.NODE_ENV, pid: process.pid }, 'Server started');
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, shutting down gracefully`);

  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out after 10s, forcing exit');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async () => {
    try {
      await prisma.$disconnect();
      await redisClient.quit();
      await cacheClient.quit();
      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown cleanup');
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
process.on('SIGINT', () => { void shutdown('SIGINT'); });

export default server;
