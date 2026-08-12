import type { Context, Next } from 'hono';
import { logger } from '@/common/logger';

export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  const { method, path } = c.req;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  logger.info('HTTP Request', {
    method,
    path,
    status,
    duration: `${duration}ms`,
  });
}
