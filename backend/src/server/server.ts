import { serve } from '@hono/node-server';
import { app } from './app';
import { logger } from '@/common/logger';
import { config } from './config';

const port = config.port;

logger.info(`Starting AlgoForge Backend Server...`);
logger.info(`Environment: ${config.nodeEnv}`);
logger.info(`Port: ${port}`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  logger.info(`🚀 Server running at http://localhost:${info.port}`);
  logger.info(`📚 API available at http://localhost:${info.port}/api/v1`);
  logger.info(`🏥 Health check at http://localhost:${info.port}/api/v1/health`);
});
