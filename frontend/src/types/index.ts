// Placeholder: Core type definitions
// These will be expanded as features are implemented

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface Analysis {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface AnalysisReport {
  analysisId: string;
  repository: {
    name: string;
    fileCount: number;
    tealFiles: string[];
    pytealFiles: string[];
  };
  summary: {
    overallScore: number;
    securityScore: number;
    optimizationScore: number;
    costScore: number;
  };
  findings: Finding[];
  recommendations: Recommendation[];
  payment?: PaymentInfo;
  proof?: ProofInfo;
}

export interface Finding {
  id: string;
  ruleId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  file: string;
  line: number;
  description: string;
  estimatedImpact?: number;
}

export interface Recommendation {
  id: string;
  findingId: string;
  description: string;
  suggestedCode?: string;
  verificationStatus: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'UNVERIFIED';
  improvement?: {
    opcodes?: number;
    cost?: number;
    percentage?: number;
  };
}

export interface PaymentInfo {
  amount: string;
  asset: string;
  transactionId: string;
}

export interface ProofInfo {
  reportHash: string;
  algorithm: string;
  transactionId: string;
  network: string;
  timestamp: string;
}
