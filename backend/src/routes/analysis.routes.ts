import { Hono } from 'hono';
import { logger } from '@/common/logger';
import type { ApiResponse } from '@/types';

export const analysisRoutes = new Hono();

// Note: x402 payment middleware is applied at the app level in app.ts
// The official @x402-avm/hono middleware automatically protects 
// "POST /api/v1/analyze" based on the route config in x402/config.ts

// POST /api/v1/analyze - Main analysis endpoint (x402 protected)
analysisRoutes.post('/', async (c) => {
  try {
    logger.info('Analysis request received (payment verified by x402 middleware)');

    // Parse request body
    const body = await c.req.json();
    const { code, language } = body as {
      code?: string;
      language?: 'teal' | 'pyteal';
    };

    // Validate input
    if (!code || !language) {
      return c.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: code and language',
        },
      }, 400);
    }

    // Generate analysis ID
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Starting analysis', {
      analysisId,
      language,
      codeLength: code.length,
    });

    // Phase 3+: Actual analysis will be implemented here
    // For now, return a structured response showing the payment went through
    const response: ApiResponse<any> = {
      success: true,
      data: {
        analysisId,
        status: 'completed',
        timestamp: new Date().toISOString(),
        repository: {
          name: 'uploaded-code',
          fileCount: 1,
          tealFiles: language === 'teal' ? ['code.teal'] : [],
          pytealFiles: language === 'pyteal' ? ['code.py'] : [],
        },
        summary: {
          overallScore: 75,
          securityScore: 80,
          optimizationScore: 70,
          costScore: 75,
        },
        findings: [
          {
            id: 'F001',
            ruleId: 'DEMO_FINDING',
            severity: 'INFO' as const,
            file: language === 'teal' ? 'code.teal' : 'code.py',
            line: 1,
            description: 'This is a demo finding. Real analysis will be implemented in Phase 4.',
            estimatedImpact: 5,
          },
        ],
        recommendations: [],
        verifiedImprovements: [],
        estimatedImprovements: [],
        proof: {
          reportHash: generateDemoHash(analysisId),
          algorithm: 'sha256' as const,
          network: 'algorand:testnet-v1.0',
          timestamp: new Date().toISOString(),
        },
      },
    };

    logger.info('Analysis completed', { analysisId });

    return c.json(response);
  } catch (error) {
    logger.error('Analysis error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return c.json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: 'An error occurred during analysis',
      },
    }, 500);
  }
});

// GET /api/v1/analyze/:id - Get analysis by ID
analysisRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  logger.info('Analysis retrieval requested', { id });

  // Phase 3+: Retrieve from database
  return c.json({
    success: true,
    data: {
      analysisId: id,
      status: 'completed',
      message: 'Analysis retrieval will be implemented in Phase 3 (database integration)',
    },
  });
});

// Helper function to generate demo hash
function generateDemoHash(input: string): string {
  // Simple hash for demo purposes
  // Phase 7: Replace with actual SHA-256
  return `hash_${input.slice(0, 16)}`;
}
