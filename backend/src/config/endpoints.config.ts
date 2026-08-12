/**
 * x402 Endpoint Payment Configuration
 *
 * Defines all payment-protected routes for AlgoForge.
 * The network CAIP-2 ID is imported as a constant from @x402/avm —
 * never hardcoded in multiple places.
 *
 * To add a new protected route:
 *   1. Add an entry here matching the "METHOD /path" key shape.
 *   2. Create a handler in backend/src/handlers/.
 *   3. Register the handler + middleware in app.ts.
 */

// The exact CAIP-2 ID as supported by the Facilitator (from facilitator-api.md)
export const ALGORAND_TESTNET_CAIP2 = 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';


// ---------------------------------------------------------------------------
// Route configuration
// ---------------------------------------------------------------------------

/**
 * The Algorand wallet address that receives payments.
 * Read from AVM_ADDRESS env var; falls back to empty string (server will
 * return 500 on the first payment attempt if not set).
 */
const PAY_TO = process.env.AVM_ADDRESS ?? '';

/**
 * RoutesConfig object consumed by paymentMiddlewareFromConfig().
 *
 * Shape mirrors the reference at reference/x402/endpoints-config-example.ts:
 *   "METHOD /path": { accepts: { … }, description: "…" }
 */
export const analyzeRoutes = {
  /**
   * Quick analysis tier — lightweight static checks.
   * Price: $0.01 USDC on Algorand TestNet.
   */
  'POST /api/v1/analyze/quick': {
    accepts: {
      scheme: 'exact' as const,
      network: ALGORAND_TESTNET_CAIP2,
      payTo: PAY_TO,
      price: '$0.01',
    },
    description: 'Quick TEAL/PyTeal static analysis — $0.01 USDC',
  },

  /**
   * Deep analysis tier — full SLM-powered optimization + security audit.
   * Price: $0.05 USDC on Algorand TestNet.
   */
  'POST /api/v1/analyze/deep': {
    accepts: {
      scheme: 'exact' as const,
      network: ALGORAND_TESTNET_CAIP2,
      payTo: PAY_TO,
      price: '$0.05',
    },
    description: 'Deep TEAL/PyTeal SLM analysis — $0.05 USDC',
  },
} as const;

export type AnalyzeRoutesConfig = typeof analyzeRoutes;
