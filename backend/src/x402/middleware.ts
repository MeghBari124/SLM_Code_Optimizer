/**
 * x402 Payment Middleware for Hono
 * Uses official @x402-avm/hono package for payment-gated routes
 */

import { paymentMiddlewareFromConfig } from '@x402/hono';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { ExactAvmScheme } from '@x402/avm/exact/server';
import { ALGORAND_TESTNET_CAIP2 } from '@/config/endpoints.config';
import { x402Routes, facilitatorUrl } from './config';
import { logger } from '@/common/logger';

// ---------- Facilitator Client ----------
// The HTTPFacilitatorClient handles payment verification and settlement
// via the GoPlausible facilitator service

let facilitatorClient: InstanceType<typeof HTTPFacilitatorClient>;

try {
  facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
  logger.info('x402 Facilitator client initialized', {
    facilitatorUrl,
    protectedRoutes: Object.keys(x402Routes),
  });
} catch (error) {
  logger.error('Failed to initialize x402 Facilitator client', {
    error: error instanceof Error ? error.message : 'Unknown error',
    facilitatorUrl,
  });
  // Fallback: create without explicit URL (uses default)
  facilitatorClient = new HTTPFacilitatorClient();
}

// ---------- Payment Middleware ----------
// paymentMiddlewareFromConfig automatically:
// 1. Intercepts requests to protected routes
// 2. Returns 402 Payment Required with payment challenge if no payment header
// 3. Verifies payment via the facilitator
// 4. Settles the transaction on Algorand
// 5. Allows the request through if payment is valid

export const x402PaymentMiddleware = paymentMiddlewareFromConfig(
  x402Routes,
  facilitatorClient,
  [{ network: ALGORAND_TESTNET_CAIP2, server: new ExactAvmScheme() }]
);

export { facilitatorClient };
