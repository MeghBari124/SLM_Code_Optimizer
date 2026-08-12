import { Hono } from 'hono';
import { logger } from '@/common/logger';

export const healthRoutes = new Hono();

// Health check endpoint
healthRoutes.get('/', (c) => {
  logger.debug('Health check requested');

  return c.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Detailed health check (includes dependencies)
healthRoutes.get('/detailed', async (c) => {
  logger.debug('Detailed health check requested');

  // Phase 2+: Add checks for database, facilitator, AI service
  const checks = {
    server: 'healthy',
    // database: await checkDatabase(),
    // facilitator: await checkFacilitator(),
    // ai: await checkAI(),
  };

  const allHealthy = Object.values(checks).every((status) => status === 'healthy');

  return c.json({
    status: allHealthy ? 'ok' : 'degraded',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    checks,
  }, allHealthy ? 200 : 503);
});
