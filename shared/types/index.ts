/**
 * Shared types between frontend and backend
 * Keep this file synchronized with frontend/src/types and backend/src/types
 */

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

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type VerificationStatus = 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'UNVERIFIED' | 'FAILED';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Analysis {
  id: string;
  status: AnalysisStatus;
  createdAt: string;
  completedAt?: string;
}

export interface AnalysisReport {
  analysisId: string;
  timestamp: string;
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
