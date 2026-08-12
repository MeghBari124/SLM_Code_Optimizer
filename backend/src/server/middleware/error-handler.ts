import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { logger } from '@/common/logger';
import { AppError } from '@/common/errors';

export function errorHandler(err: Error, c: Context) {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  // Handle Hono HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: {
        code: 'HTTP_ERROR',
        message: err.message,
      },
    }, err.status);
  }

  // Handle custom app errors
  if (err instanceof AppError) {
    return c.json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    }, err.statusCode as 400 | 401 | 402 | 403 | 404 | 500);
  }

  // Handle generic errors
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
  }, 500);
}
