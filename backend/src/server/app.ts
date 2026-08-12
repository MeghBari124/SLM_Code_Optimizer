import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { paymentMiddlewareFromConfig } from '@x402/hono';
import { ExactAvmScheme } from '@x402/avm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { healthRoutes } from '@/routes/health.routes';
import { analysisRoutes } from '@/routes/analysis.routes';
import { analyzeRoutes, ALGORAND_TESTNET_CAIP2 as LOCAL_CAIP2 } from '@/config/endpoints.config';
import { handleAnalyzeQuick } from '@/handlers/analyzeQuick';
import { handleAnalyzeDeep } from '@/handlers/analyzeDeep';
import { config } from './config';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';

// ---------------------------------------------------------------------------
// x402 facilitator client & scheme registration
// Pointing at FACILITATOR_URL from env (default: https://facilitator.goplausible.xyz)
// ---------------------------------------------------------------------------
const facilitatorClient = new HTTPFacilitatorClient({
  url: process.env.FACILITATOR_URL ?? 'https://facilitator.goplausible.xyz',
});

// Explicitly register the AVM exact scheme implementation for the Algorand network
const avmSchemes = [
  {
    network: LOCAL_CAIP2,
    server: new ExactAvmScheme(),
  },
];

// ---------------------------------------------------------------------------
// Hono app
// ---------------------------------------------------------------------------
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
  allowHeaders: ['Content-Type', 'Authorization', 'X-Transaction-Id', 'X-Wallet-Address', 'X-Payment'],
  exposeHeaders: ['payment-required'],
}));

// ---------------------------------------------------------------------------
// x402 payment middleware — applied ONLY to the two new analyze routes.
// /api/v1/health is NOT affected.
// ---------------------------------------------------------------------------
app.use(
  '/api/v1/analyze/quick',
  paymentMiddlewareFromConfig(analyzeRoutes, facilitatorClient, avmSchemes),
);
app.use(
  '/api/v1/analyze/deep',
  paymentMiddlewareFromConfig(analyzeRoutes, facilitatorClient, avmSchemes),
);

// ---------------------------------------------------------------------------
// Protected route handlers
// ---------------------------------------------------------------------------
app.post('/api/v1/analyze/quick', handleAnalyzeQuick);
app.post('/api/v1/analyze/deep', handleAnalyzeDeep);

// ---------------------------------------------------------------------------
// Existing routes (unaffected)
// ---------------------------------------------------------------------------
app.route('/api/v1/health', healthRoutes);
app.route('/api/v1/analyze', analysisRoutes);

// Root route
app.get('/', (c) => {
  return c.json({
    name: 'AlgoForge API',
    version: '1.0.0',
    status: 'running',
    phase: 'Phase 2 - x402 Integration',
    docs: '/api/v1/health',
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
