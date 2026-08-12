/**
 * Type definitions for the TEAL static analysis module.
 *
 * These are intentionally separate from the global AnalysisResult type in
 * src/types/index.ts — the orchestrator is responsible for mapping
 * TealAnalysisResult → AnalysisResult (adding IDs, scores, payment info, etc.).
 */

// ---------------------------------------------------------------------------
// Storage operation counts
// ---------------------------------------------------------------------------

export interface StorageOps {
  /** app_local_get calls */
  appLocalGet: number;
  /** app_local_put calls */
  appLocalPut: number;
  /** app_global_get calls */
  appGlobalGet: number;
  /** app_global_put calls */
  appGlobalPut: number;
  /** box_get calls */
  boxGet: number;
  /** box_put calls */
  boxPut: number;
}

// ---------------------------------------------------------------------------
// Pseudo-function / label block
// ---------------------------------------------------------------------------

export interface TealFunction {
  /** Label name (e.g. "main", "handle_noop") */
  name: string;
  /** 1-indexed line where the label definition appears */
  startLine: number;
  /** 1-indexed line of the last instruction before the next label or EOF */
  endLine: number;
  /** Number of non-comment, non-blank instructions inside this block */
  opcodeCount: number;
}

// ---------------------------------------------------------------------------
// Top-level result
// ---------------------------------------------------------------------------

export interface TealAnalysisResult {
  /** Original file name passed to analyzeTeal() */
  fileName: string;
  /**
   * Map of opcode → occurrence count.
   * Only opcodes actually present in the source are included.
   */
  opcodeCounts: Record<string, number>;
  /** Breakdown of storage-related opcode calls */
  storageOps: StorageOps;
  /** Number of `itxn_begin` / `itxn_submit` pairs (inner transaction groups) */
  innerTransactions: number;
  /** Total count of substantive instructions (excludes comments and blank lines) */
  totalInstructions: number;
  /**
   * Array of pseudo-functions derived from label definitions.
   * Labels at the top level of TEAL source are treated as function boundaries.
   */
  functions: TealFunction[];
}
