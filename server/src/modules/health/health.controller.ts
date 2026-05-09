import type { Request, Response } from 'express';
import logger from '../../core/logger';
import { AppError } from '../../core/errors';

export class HealthController {
  async check(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Health check requested');
      
      res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      });
      return;
    } catch (error) {
      logger.error({ error }, 'Health check failed');
      throw new AppError('Health check failed', 500);
      return;
    }
  }
}
