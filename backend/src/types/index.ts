// Core type definitions for AlgoForge backend
// These will be expanded as features are implemented

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Analysis types
export interface AnalysisRequest {
  language: 'teal' | 'pyteal';
  files: UploadedFile[];
  options?: AnalysisOptions;
}

export interface UploadedFile {
  name: string;
  content: string;
  size: number;
}

export interface AnalysisOptions {
  includeSecurityScan?: boolean;
  includeCostAnalysis?: boolean;
  includeOptimization?: boolean;
}

export interface AnalysisResult {
  analysisId: string;
  repository: RepositoryInfo;
  summary: AnalysisSummary;
  findings: Finding[];
  recommendations: Recommendation[];
  verifiedImprovements: VerifiedImprovement[];
  estimatedImprovements: EstimatedImprovement[];
  payment?: PaymentInfo;
  proof?: ProofInfo;
}

export interface RepositoryInfo {
  name: string;
  fileCount: number;
  tealFiles: string[];
  pytealFiles: string[];
}

export interface AnalysisSummary {
  overallScore: number;
  securityScore: number;
  optimizationScore: number;
  costScore: number;
}

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface Finding {
  id: string;
  ruleId: string;
  severity: Severity;
  file: string;
  line: number;
  description: string;
  estimatedImpact?: number;
  suggestedFix?: string;
}

export type VerificationStatus = 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'UNVERIFIED' | 'FAILED';

export interface Recommendation {
  id: string;
  findingId: string;
  description: string;
  suggestedCode?: string;
  verificationStatus: VerificationStatus;
  improvement?: ImprovementMetrics;
}

export interface ImprovementMetrics {
  opcodes?: number;
  cost?: number;
  percentage?: number;
}

export interface VerifiedImprovement {
  recommendationId: string;
  beforeMetrics: Metrics;
  afterMetrics: Metrics;
  improvement: ImprovementMetrics;
}

export interface EstimatedImprovement {
  recommendationId: string;
  estimatedImpact: ImprovementMetrics;
  confidence: number;
}

export interface Metrics {
  opcodeCount: number;
  estimatedCost: number;
  complexity?: number;
}

export interface PaymentInfo {
  amount: string;
  asset: string;
  transactionId: string;
  network: string;
  timestamp: string;
}

export interface ProofInfo {
  reportHash: string;
  algorithm: 'sha256';
  transactionId: string;
  network: string;
  timestamp: string;
  verificationUrl?: string;
}

// x402 types
export interface X402Challenge {
  accepts: X402AcceptEntry[];
}

export interface X402AcceptEntry {
  scheme: 'exact';
  network: string; // CAIP-2 format
  asset: string;
  payTo: string;
  price: string;
  maxTimeoutSeconds?: number;
}

export interface X402PaymentProof {
  signature: string;
  transactionId: string;
  timestamp: string;
}
