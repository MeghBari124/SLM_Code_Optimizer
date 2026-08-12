/**
 * Static Analysis Module — Public API
 *
 * Import from here, not from individual implementation files.
 *
 * Usage:
 *   import { analyzeTeal } from '@/analysis/static-analysis';
 *   import type { TealAnalysisResult } from '@/analysis/static-analysis';
 */

export { analyzeTeal } from './teal-analyzer';
export type { TealAnalysisResult, TealFunction, StorageOps } from './types';
