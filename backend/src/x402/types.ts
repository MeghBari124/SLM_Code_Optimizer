/**
 * x402 Type Definitions
 * 
 * Most types are now provided by the official @x402-avm packages.
 * This file contains AlgoForge-specific types that extend the protocol.
 */

// Payment context attached to requests after successful payment
export interface X402PaymentContext {
  transactionId: string;
  amount: string;
  sender?: string;
}

// Export types used across the application
