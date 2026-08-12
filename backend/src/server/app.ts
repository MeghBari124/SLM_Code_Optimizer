import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { healthRoutes } from '@/routes/health.routes';
import { analysisRoutes } from '@/routes/analysis.routes';
import { config } from './config';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { x402PaymentMiddleware } from '@/x402/middleware';

// Create Hono app
export const app = new Hono();

// Global middleware
app.use('*', honoLogger());
app.use('*', requestLogger);

// CORS configuration
app.use('/api/*', cors({
  origin: config.nodeEnv === 'production'
    ? config.corsOrigins
    : ['http://localhost:5173'],
  credentials: false,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Transaction-Id', 'X-Wallet-Address', 'X-Payment', 'PAYMENT-SIGNATURE'],
}));

// x402 Payment Middleware (applied globally - only intercepts protected routes)
// The middleware automatically checks route keys like "POST /api/v1/analyze"
// and only triggers the 402 flow for matching routes
app.use('/api/*', x402PaymentMiddleware);

// Routes
app.route('/api/v1/health', healthRoutes);
app.route('/api/v1/analyze', analysisRoutes);

// Root route
app.get('/', (c) => {
  return c.json({
    name: 'AlgoForge API',
    version: '1.0.0',
    status: 'running',
    phase: 'Phase 2 - x402 Integration (Official @x402-avm)',
    docs: '/api/v1/health',
    x402: {
      facilitator: config.x402.facilitatorUrl,
      network: 'Algorand TestNet',
      price: `$${config.x402.defaultPrice} USDC per analysis`,
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  }, 404);
});

// Error handler (must be last)
app.onError(errorHandler);

export default app;
