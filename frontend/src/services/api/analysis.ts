import { apiRequest, apiClient } from './client';
import type { TealAnalysisResult } from '@/types';


export interface AnalyzeQuickRequest {
  source: string;
  fileName: string;
}

/**
 * Handles calling the /analyze/quick endpoint.
 * Intercepts 402 Payment Required errors, parses the x402 header,
 * constructs an Algorand transaction, and returns it along with the error
 * so the UI can prompt the user to sign it.
 */
export async function analyzeTealQuick(
  data: AnalyzeQuickRequest,
  signedTxnPayment?: Uint8Array
): Promise<TealAnalysisResult> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (signedTxnPayment) {
      // Encode the signed transaction to base64
      let binary = '';
      for (let i = 0; i < signedTxnPayment.length; i++) {
        binary += String.fromCharCode(signedTxnPayment[i]);
      }
      const base64SignedTxn = window.btoa(binary);
      
      const paymentPayload = {
        scheme: 'exact',
        proof: base64SignedTxn
      };
      
      headers['X-Payment'] = window.btoa(JSON.stringify(paymentPayload));
    }

    const response = await apiClient.post<TealAnalysisResult>('/analyze/quick', data, { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 402) {
      const paymentRequiredHeader = error.response.headers['payment-required'];
      if (paymentRequiredHeader) {
        try {
          const decodedStr = window.atob(paymentRequiredHeader);
          const requirements = JSON.parse(decodedStr);
          
          // Attach requirements to the error so the UI can use them
          error.paymentRequirements = requirements;
        } catch (e) {
          console.error("Failed to parse 402 payment-required header", e);
        }
      }
    }
    throw error;
  }
}
