/**
 * x402 Type Definitions
 */

export interface X402PaymentContext {
  transactionId: string;
  amount: string;
  sender?: string;
}

export interface X402Challenge {
  accepts: X402AcceptEntry[];
}

export interface X402AcceptEntry {
  scheme: 'exact';
  network: string; // CAIP-2 format (e.g., algorand:testnet-v1.0)
  extra: {
    asset: string; // Asset ID for payment
  };
  payTo: string; // Destination wallet address
  price: string; // Price in USD (e.g., "$0.02")
  maxTimeoutSeconds?: number;
}

export interface X402PaymentProof {
  transactionId: string;
  signature?: string;
  timestamp: string;
}

export interface X402VerificationResult {
  valid: boolean;
  transactionId?: string;
  amount?: string;
  sender?: string;
  error?: string;
}

// Request headers
export const X402_HEADERS = {
  PAYMENT_HEADER: 'X-Payment',
  TRANSACTION_ID: 'X-Transaction-Id',
  WALLET_ADDRESS: 'X-Wallet-Address',
} as const;
