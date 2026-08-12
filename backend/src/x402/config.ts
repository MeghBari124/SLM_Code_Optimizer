/**
 * x402 Payment Configuration
 * Uses official @x402-avm packages for Algorand x402 protocol
 */

import { config } from '@/server/config';
import { ALGORAND_TESTNET_CAIP2 } from '@x402-avm/avm';

// ---------- Route Configuration ----------
// Keys must match "METHOD /path" format expected by @x402-avm/hono middleware

export const x402Routes: any = {
  'POST /api/v1/analyze': {
    accepts: {
      scheme: 'exact',
      network: ALGORAND_TESTNET_CAIP2,
      payTo: config.x402.payToAddress,
      price: `$${config.x402.defaultPrice}`,
      maxTimeoutSeconds: config.x402.maxTimeoutSeconds,
      extra: {
        asset: config.x402.asset,
      },
    },
    description: 'TEAL/PyTeal code analysis with optimization recommendations',
    mimeType: 'application/json',
  },
};

// ---------- Facilitator Configuration ----------

export const facilitatorUrl = config.x402.facilitatorUrl;

// ---------- Paywall Configuration ----------

export const paywallConfig = {
  appName: 'AlgoForge',
  testnet: true,
};
