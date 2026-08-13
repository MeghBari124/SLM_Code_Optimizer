import { apiClient } from './client';
import type { TealAnalysisResult, OptimizationReport } from '@/types';
import { Buffer } from 'buffer';

export interface AnalyzeQuickRequest {
  source: string;
  fileName: string;
}

function buildPaymentHeader(paymentPayload: any): Record<string, string> {
  // The payload from x402Client.createPaymentPayload() is already the complete
  // object { x402Version, payload, accepted, resource }.
  // We must base64-encode the JSON of the ENTIRE object.
  const encoded = Buffer.from(JSON.stringify(paymentPayload), 'utf8').toString('base64');
  return { 'payment-signature': encoded };
}

/**
 * Handles calling the /analyze/quick endpoint.
 * Intercepts 402 Payment Required errors, parses the x402 header,
 * and returns so the UI can prompt the user to sign and retry.
 */
export async function analyzeTealQuick(
  data: AnalyzeQuickRequest,
  paymentPayload?: any
): Promise<TealAnalysisResult> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(paymentPayload ? buildPaymentHeader(paymentPayload) : {}),
    };

    const response = await apiClient.post<TealAnalysisResult>('/analyze/quick', data, { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 402) {
      const paymentRequiredHeader =
        error.response.headers['payment-required'] ||
        error.response.headers['PAYMENT-REQUIRED'];

      if (paymentRequiredHeader) {
        try {
          const decodedStr = Buffer.from(paymentRequiredHeader, 'base64').toString('utf8');
          error.paymentRequirements = JSON.parse(decodedStr);
          console.log('[x402] Payment requirements from 402:', error.paymentRequirements);
        } catch (e) {
          console.error('Failed to parse 402 payment-required header', e);
        }
      } else {
        // Retry 402 — server rejected signed payment. Log full body for debugging.
        console.error('[x402] Server rejected signed payment (retry 402). Body:', error.response.data);
      }
    }
    throw error;
  }
}

/**
 * Handles calling the /analyze/deep endpoint for AI Orchestration.
 */
export async function analyzeTealDeep(
  data: AnalyzeQuickRequest,
  paymentPayload?: any
): Promise<OptimizationReport> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(paymentPayload ? buildPaymentHeader(paymentPayload) : {}),
    };

    const response = await apiClient.post<OptimizationReport>('/analyze/deep', data, { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 402) {
      const paymentRequiredHeader =
        error.response.headers['payment-required'] ||
        error.response.headers['PAYMENT-REQUIRED'];

      if (paymentRequiredHeader) {
        try {
          const decodedStr = Buffer.from(paymentRequiredHeader, 'base64').toString('utf8');
          error.paymentRequirements = JSON.parse(decodedStr);
          console.log('[x402] Payment requirements from 402:', error.paymentRequirements);
        } catch (e) {
          console.error('Failed to parse 402 payment-required header', e);
        }
      } else {
        console.error('[x402] Server rejected signed payment (retry 402). Body:', error.response.data);
      }
    }
    throw error;
  }
}

export interface AnalyzeRepoRequest {
  files: Array<{ fileName: string; source: string }>;
}

export interface RepoOptimizationReport {
  repoSummary: {
    totalOpcodes: number;
    totalStorageOps: any;
    filesAnalyzed: number;
    hotFunctionsCount: number;
  };
  fileReports: Array<{
    fileName: string;
    findings: any[]; // Assuming ValidatedFinding[]
  }>;
}

/**
 * Handles calling the /analyze/repo endpoint for AI Repo Orchestration.
 */
export async function analyzeTealRepo(
  data: AnalyzeRepoRequest,
  paymentPayload?: any
): Promise<RepoOptimizationReport> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(paymentPayload ? buildPaymentHeader(paymentPayload) : {}),
    };

    const response = await apiClient.post<RepoOptimizationReport>('/analyze/repo', data, { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 402) {
      const paymentRequiredHeader =
        error.response.headers['payment-required'] ||
        error.response.headers['PAYMENT-REQUIRED'];

      if (paymentRequiredHeader) {
        try {
          const decodedStr = Buffer.from(paymentRequiredHeader, 'base64').toString('utf8');
          error.paymentRequirements = JSON.parse(decodedStr);
        } catch (e) {
          console.error('Failed to parse 402 payment-required header', e);
        }
      }
    }
    throw error;
  }
}
