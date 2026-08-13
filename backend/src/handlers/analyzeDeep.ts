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
import { runOptimizationPipeline } from '../ai/orchestrator';

export async function handleAnalyzeDeep(c: Context) {
  try {
    const body = await c.req.json();
    
    if (typeof body.source !== 'string' || typeof body.fileName !== 'string') {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request body must contain "source" (string) and "fileName" (string)',
          },
        },
        400
      );
    }

    const { source, fileName } = body;
    const report = await runOptimizationPipeline(source, fileName);

    return c.json(report);
  } catch (error) {
    console.error('[handleAnalyzeDeep] Error:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during deep analysis orchestration',
        },
      },
      500
    );
  }
}
