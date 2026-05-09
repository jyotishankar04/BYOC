import type { Request, Response, NextFunction } from 'express';
import logger from '@/core/logger';
import { AppError } from '@/core/errors';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error({ err, path: req.path, method: req.method }, 'Error occurred');

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
