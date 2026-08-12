/**
 * x402 Payment Configuration
 * Based on Algorand x402 specification
 */

import { config } from '@/server/config';

import type { X402AcceptEntry } from './types';

export interface X402Config {
  facilitatorUrl: string;
  network: string; // CAIP-2 format
  payToAddress: string;
  defaultPrice: string;
  maxTimeoutSeconds: number;
}

export interface X402Resource {
  path: string;
  method: string;
  price: string;
  description: string;
  accepts: X402AcceptEntry[];
}

// x402 configuration
export const x402Config: X402Config = {
  facilitatorUrl: config.x402.facilitatorUrl,
  network: config.x402.network,
  payToAddress: config.x402.payToAddress,
  defaultPrice: config.x402.defaultPrice,
  maxTimeoutSeconds: config.x402.maxTimeoutSeconds,
};

// Define protected resources
export const protectedResources: Record<string, X402Resource> = {
  'POST /api/v1/analyze': {
    path: '/api/v1/analyze',
    method: 'POST',
    price: '$0.02',
    description: 'TEAL/PyTeal code analysis with optimization recommendations',
    accepts: [
      {
        scheme: 'exact',
        network: config.x402.network,
        extra: {
          asset: config.x402.asset,
        },
        payTo: config.x402.payToAddress,
        price: '$0.02',
        maxTimeoutSeconds: config.x402.maxTimeoutSeconds,
      },
    ],
  },
};

// Helper to get resource config
export function getResourceConfig(method: string, path: string): X402Resource | undefined {
  const key = `${method} ${path}`;
  return protectedResources[key];
}
