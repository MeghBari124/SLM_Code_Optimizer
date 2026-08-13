import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';

import { paymentMiddlewareFromConfig } from '@x402/hono';
import { ExactAvmScheme } from '@x402/avm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';

import { healthRoutes } from '@/routes/health.routes';
import { analysisRoutes } from '@/routes/analysis.routes';
import {
  analyzeRoutes,
  ALGORAND_TESTNET_CAIP2 as LOCAL_CAIP2,
} from '@/config/endpoints.config';

import { handleAnalyzeQuick } from '@/handlers/analyzeQuick';
import { handleAnalyzeDeep } from '@/handlers/analyzeDeep';

import { config } from './config';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';


// ---------------------------------------------------------------------------
// x402 facilitator client
// ---------------------------------------------------------------------------

const facilitatorClient = new HTTPFacilitatorClient({
  url:
    process.env.X402_FACILITATOR_URL ??
    'https://facilitator.goplausible.xyz',
});


// ---------------------------------------------------------------------------
// AVM exact scheme registration
// ---------------------------------------------------------------------------

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


// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

app.use('*', honoLogger());
app.use('*', requestLogger);


// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

app.use(
  '/api/*',
  cors({
    origin:
      config.nodeEnv === 'production'
        ? config.corsOrigins
        : ['http://localhost:5173'],

    credentials: false,

    allowMethods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS',
    ],

    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Transaction-Id',
      'X-Wallet-Address',
      'X-Payment',
      'PAYMENT-SIGNATURE',
    ],

    exposeHeaders: [
      'payment-required',
    ],
  }),
);


// ---------------------------------------------------------------------------
// x402 payment middleware
// ---------------------------------------------------------------------------
//
// Payment is required only for the protected analysis endpoints.
// Health endpoint remains publicly accessible.
// ---------------------------------------------------------------------------

app.use(
  '/api/v1/analyze/quick',
  paymentMiddlewareFromConfig(
    analyzeRoutes,
    facilitatorClient,
    avmSchemes,
  ),
);

app.use(
  '/api/v1/analyze/deep',
  paymentMiddlewareFromConfig(
    analyzeRoutes,
    facilitatorClient,
    avmSchemes,
  ),
);


// ---------------------------------------------------------------------------
// Health routes
// ---------------------------------------------------------------------------

app.route(
  '/api/v1/health',
  healthRoutes,
);


// ---------------------------------------------------------------------------
// Analysis routes
// ---------------------------------------------------------------------------

app.route(
  '/api/v1/analyze',
  analysisRoutes,
);


// ---------------------------------------------------------------------------
// Protected analysis handlers
// ---------------------------------------------------------------------------

app.post(
  '/api/v1/analyze/quick',
  handleAnalyzeQuick,
);

app.post(
  '/api/v1/analyze/deep',
  handleAnalyzeDeep,
);


// ---------------------------------------------------------------------------
// Root route
// ---------------------------------------------------------------------------

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


// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    },
    404,
  );
});


// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------

app.onError(errorHandler);

export default app;