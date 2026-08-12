/**
 * Application-wide constants
 */

// File constraints
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILES_PER_ANALYSIS = 100;
export const MAX_ZIP_SIZE = 100 * 1024 * 1024; // 100MB

// Allowed file extensions
export const ALLOWED_EXTENSIONS = ['.teal', '.py'] as const;

// MIME types
export const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/x-python',
  'application/x-python-code',
  'application/octet-stream',
] as const;

// Analysis timeouts
export const ANALYSIS_TIMEOUT_MS = 120000; // 2 minutes
export const AI_REQUEST_TIMEOUT_MS = 30000; // 30 seconds

// Severity levels
export const SEVERITY_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] as const;

// Verification statuses
export const VERIFICATION_STATUSES = [
  'VERIFIED',
  'PARTIALLY_VERIFIED',
  'UNVERIFIED',
  'FAILED',
] as const;

// x402 constants
export const X402_SCHEME = 'exact' as const;
export const ALGORAND_TESTNET_CAIP2 = 'algorand:testnet-v1.0';
export const ALGORAND_MAINNET_CAIP2 = 'algorand:mainnet-v1.0';

// API response codes
export const API_ERROR_CODES = {
  // Client errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Server errors (5xx)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  ANALYSIS_ERROR: 'ANALYSIS_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  FACILITATOR_ERROR: 'FACILITATOR_ERROR',
} as const;
