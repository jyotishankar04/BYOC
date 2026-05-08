import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '@/core/logger';
import { AppError } from '@/core/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isDev = process.env.NODE_ENV !== 'production';

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.issues,
        ...(isDev && { stack: err.stack }),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn({ err, path: req.path, method: req.method }, 'Operational error');
    res.status(err.statusCode).json({
      error: {
        code: err.code ?? 'APP_ERROR',
        message: err.message,
        ...(isDev && { stack: err.stack }),
      },
    });
    return;
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev ? err.message : 'Internal server error',
      ...(isDev && { stack: err.stack }),
    },
  });
}
