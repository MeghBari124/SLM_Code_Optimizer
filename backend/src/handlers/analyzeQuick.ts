/**
 * Handler: POST /api/v1/analyze/quick
 *
 * Payment gate is enforced upstream by paymentMiddlewareFromConfig.
 * By the time execution reaches here the x402 library has already verified
 * and settled the $0.01 USDC payment.
 */

import type { Context } from 'hono';
import { analyzeTeal } from '../analysis/static-analysis';

export async function handleAnalyzeQuick(c: Context) {
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
    const analysisResult = analyzeTeal(source, fileName);

    return c.json(analysisResult);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during analysis',
        },
      },
      500
    );
  }
}
