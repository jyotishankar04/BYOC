import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from 'express';
import logger from '../../core/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = randomUUID();
  res.setHeader("X-Request-Id", requestId);
  res.locals.requestId = requestId;

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      { requestId, method: req.method, path: req.path, status: res.statusCode, duration: `${duration}ms`, ip: req.ip },
      'Request completed',
    );
  });

  next();
}
