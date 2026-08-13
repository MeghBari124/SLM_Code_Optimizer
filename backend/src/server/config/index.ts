import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

export const config = {
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || 'localhost',

  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost/algoforge',
  },

  // x402 Configuration
  x402: {
    facilitatorUrl: process.env.X402_FACILITATOR_URL || 'https://facilitator.goplausible.xyz',
    network: process.env.X402_NETWORK || 'algorand:testnet-v1.0',
    payToAddress: process.env.X402_PAY_TO_ADDRESS || process.env.AVM_ADDRESS || '',
    asset: process.env.X402_ASSET || '10458941', // USDC ASA ID on Algorand TestNet
    defaultPrice: process.env.X402_DEFAULT_PRICE || '0.02',
    maxTimeoutSeconds: parseInt(process.env.X402_MAX_TIMEOUT_SECONDS || '300', 10),
  },

  // Algorand
  algorand: {
    testnetRpc: process.env.ALGORAND_TESTNET_RPC || 'https://testnet-api.algonode.cloud',
    indexerUrl: process.env.ALGORAND_INDEXER_URL || 'https://testnet-idx.algonode.cloud',
  },

  // AI/SLM
  ai: {
    provider: process.env.AI_PROVIDER || 'groq',
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'llama-3.1-8b-instant',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4096', 10),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.2'),
  },

  // Analysis Engine
  analysis: {
    maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE || '52428800', 10), // 50MB
    maxFilesPerAnalysis: parseInt(process.env.MAX_FILES_PER_ANALYSIS || '100', 10),
    timeoutMs: parseInt(process.env.ANALYSIS_TIMEOUT_MS || '120000', 10), // 2 minutes
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
} as const;

// Validation: Ensure critical config is present
if (config.nodeEnv === 'production') {
  const requiredVars = [
    'X402_PAY_TO_ADDRESS',
    'AI_API_KEY',
  ];

  const missing = requiredVars.filter((key) => {
    const value = process.env[key];
    return !value || value === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(', ')}`
    );
  }
}

export type Config = typeof config;
