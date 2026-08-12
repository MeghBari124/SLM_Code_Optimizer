/**
 * Handler: POST /api/v1/analyze/deep
 *
 * Stub handler — payment gate is enforced upstream by paymentMiddlewareFromConfig.
 * By the time execution reaches here the x402 library has already verified
 * and settled the $0.05 USDC payment, so we only need to return the response shape.
 *
 * TODO (Phase 3): Replace stub with SLM reasoning + static analysis engine call.
 */

import type { Context } from 'hono';

export function handleAnalyzeDeep(c: Context) {
  return c.json({
    status: 'paid',
    tier: 'deep',
  });
}
