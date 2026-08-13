/**
 * x402 Payment Configuration
 * Uses official @x402-avm packages for Algorand x402 protocol
 */

import { config } from '@/server/config';
import { ALGORAND_TESTNET_CAIP2 } from '@/config/endpoints.config';

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
    description: 'Algorand smart contract optimization analysis — $0.02 USDC',
    mimeType: 'application/json',
  },
  'POST /api/v1/analyze/quick': {
    accepts: {
      scheme: 'exact',
      network: ALGORAND_TESTNET_CAIP2,
      payTo: config.x402.payToAddress,
      price: '$0.01',
      maxTimeoutSeconds: config.x402.maxTimeoutSeconds,
      extra: {
        asset: config.x402.asset,
      },
    },
    description: 'Quick TEAL/PyTeal static analysis — $0.01 USDC',
    mimeType: 'application/json',
  },
  'POST /api/v1/analyze/deep': {
    accepts: {
      scheme: 'exact',
      network: ALGORAND_TESTNET_CAIP2,
      payTo: config.x402.payToAddress,
      price: '$0.05',
      maxTimeoutSeconds: config.x402.maxTimeoutSeconds,
      extra: {
        asset: config.x402.asset,
      },
    },
    description: 'Deep TEAL/PyTeal SLM analysis — $0.05 USDC',
    mimeType: 'application/json',
  },
  'POST /api/v1/analyze/repo': {
    accepts: {
      scheme: 'exact',
      network: ALGORAND_TESTNET_CAIP2,
      payTo: config.x402.payToAddress,
      price: '$0.05',
      maxTimeoutSeconds: config.x402.maxTimeoutSeconds,
      extra: {
        asset: config.x402.asset,
      },
    },
    description: 'Repository TEAL SLM analysis — $0.05 USDC',
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
