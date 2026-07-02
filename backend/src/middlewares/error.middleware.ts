import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/ApiError';
import { logger } from '@utils/logger';
import { env } from '@config/env';

/** 404 handler - mounted after all routes */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/** Centralized error handler - mounted last in app.ts */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;
  let isOperational = false;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier supplied';
  } else if ((err as { code?: number }).code === 11000) {
    statusCode = 409;
    message = 'Duplicate value violates a unique constraint';
  }

  const logPayload = {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message: err.message,
    stack: env.isProd ? undefined : err.stack,
  };

  if (statusCode >= 500 || !isOperational) {
    logger.error('Unhandled error', logPayload);
  } else {
    logger.warn('Operational error', logPayload);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: env.isProd && statusCode === 500 ? 'Internal server error' : message,
    ...(details ? { details } : {}),
    ...(env.isProd ? {} : { stack: err.stack }),
  });
}
