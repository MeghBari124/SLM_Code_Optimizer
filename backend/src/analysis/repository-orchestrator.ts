/**
 * Repository-Level TEAL Orchestrator
 *
 * Accepts a list of TEAL file contents from a single project, runs
 * analyzeTeal() on each, and aggregates findings and metrics across
 * the entire repository.
 *
 * Design principles:
 *   - Purely deterministic / synchronous — no AI calls, no I/O.
 *   - "Hot function" threshold is computed at the 75th percentile of
 *     opcodeCount across ALL functions in the repository (not per-file),
 *     so the same threshold applies consistently regardless of file count.
 *   - Per-function StorageOps are computed by scanning only that function's
 *     source lines for storage opcodes, exactly mirroring the logic in
 *     teal-analyzer.ts.
 */

import { analyzeTeal } from './static-analysis';
import type { TealAnalysisResult, StorageOps } from './static-analysis/types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** A single TEAL file as submitted by the caller. */
export interface RepositoryFile {
  fileName: string;
  source: string;
}

/** A hot function identified across the repository. */
export interface HotFunction {
  /** The file this function belongs to. */
  fileName: string;
  /** Label name of the function block (e.g. "handle_noop"). */
  functionName: string;
  /** Opcode count for this function block. */
  opcodeCount: number;
  /** Storage ops counted within this function's source lines. */
  storageOps: StorageOps;
}

/** Aggregated analysis result for an entire repository. */
export interface RepositoryAnalysis {
  /** Per-file analysis results, in input order. */
  files: Array<{
    fileName: string;
    analysis: TealAnalysisResult;
  }>;
  /** Sum of totalInstructions across all files. */
  totalOpcodes: number;
  /** Sum of every StorageOps field across all files. */
  totalStorageOps: StorageOps;
  /**
   * Functions whose opcodeCount is at or above the 75th percentile of all
   * functions found across the repository.
   * Sorted descending by opcodeCount.
   */
  hotFunctions: HotFunction[];
}

// ---------------------------------------------------------------------------
// Storage opcode lookup (mirrors teal-analyzer.ts to stay in sync)
// ---------------------------------------------------------------------------

const STORAGE_OPCODE_MAP: Record<keyof StorageOps, string> = {
  appLocalGet: 'app_local_get',
  appLocalPut: 'app_local_put',
  appGlobalGet: 'app_global_get',
  appGlobalPut: 'app_global_put',
  boxGet: 'box_get',
  boxPut: 'box_put',
};

/** Reverse lookup: opcode string → StorageOps key */
const STORAGE_OPCODES: Map<string, keyof StorageOps> = new Map(
  Object.entries(STORAGE_OPCODE_MAP).map(([k, v]) => [v, k as keyof StorageOps]),
);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Return a zeroed StorageOps object. */
function emptyStorageOps(): StorageOps {
  return {
    appLocalGet: 0,
    appLocalPut: 0,
    appGlobalGet: 0,
    appGlobalPut: 0,
    boxGet: 0,
    boxPut: 0,
  };
}

/** Add fields of `b` into `a` in-place and return `a`. */
function addStorageOps(a: StorageOps, b: StorageOps): StorageOps {
  a.appLocalGet += b.appLocalGet;
  a.appLocalPut += b.appLocalPut;
  a.appGlobalGet += b.appGlobalGet;
  a.appGlobalPut += b.appGlobalPut;
  a.boxGet += b.boxGet;
  a.boxPut += b.boxPut;
  return a;
}

/**
 * Compute the p-th percentile (nearest-rank) of a numeric array.
 * Returns 0 for empty arrays.
 */
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, rank)]!;
}

/**
 * Compute StorageOps counts for a single function block by scanning its
 * source lines.
 *
 * @param source    Full normalised (LF) source of the file.
 * @param startLine 1-indexed first line of the function block (label line).
 * @param endLine   1-indexed last line of the function block (inclusive).
 */
function computeFunctionStorageOps(
  source: string,
  startLine: number,
  endLine: number,
): StorageOps {
  const ops = emptyStorageOps();
  const lines = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  // lines array is 0-indexed; startLine/endLine are 1-indexed.
  for (let i = startLine - 1; i < endLine && i < lines.length; i++) {
    const raw = lines[i]!;
    // Strip inline comment, grab first token
    const commentIdx = raw.indexOf('//');
    const stripped = (commentIdx >= 0 ? raw.slice(0, commentIdx) : raw).trim();
    if (stripped === '' || stripped.startsWith('#')) continue;

    const opcode = (stripped.split(/\s+/)[0] ?? '').toLowerCase();
    const storageKey = STORAGE_OPCODES.get(opcode);
    if (storageKey !== undefined) {
      ops[storageKey]++;
    }
  }

  return ops;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run the repository-level TEAL analysis pipeline.
 *
 * @param files  List of TEAL files (fileName + source) from a single project.
 * @returns      Aggregated RepositoryAnalysis — deterministic and synchronous.
 */
export function analyzeRepository(files: RepositoryFile[]): RepositoryAnalysis {
  // -------------------------------------------------------------------------
  // Step 1: Analyse each file independently
  // -------------------------------------------------------------------------
  const fileResults: Array<{ fileName: string; analysis: TealAnalysisResult }> = files.map(
    ({ fileName, source }) => ({
      fileName,
      analysis: analyzeTeal(source, fileName),
    }),
  );

  // -------------------------------------------------------------------------
  // Step 2: Aggregate totals
  // -------------------------------------------------------------------------
  let totalOpcodes = 0;
  const totalStorageOps = emptyStorageOps();

  for (const { analysis } of fileResults) {
    totalOpcodes += analysis.totalInstructions;
    addStorageOps(totalStorageOps, analysis.storageOps);
  }

  // -------------------------------------------------------------------------
  // Step 3: Collect all functions across the repository for percentile calc
  // -------------------------------------------------------------------------
  interface FlatFunction {
    fileName: string;
    source: string;
    name: string;
    startLine: number;
    endLine: number;
    opcodeCount: number;
  }

  const allFunctions: FlatFunction[] = [];

  for (const { fileName, analysis } of fileResults) {
    // Find the original source to compute per-function storage ops later
    const originalFile = files.find((f) => f.fileName === fileName);
    const source = originalFile?.source ?? '';

    for (const fn of analysis.functions) {
      allFunctions.push({
        fileName,
        source,
        name: fn.name,
        startLine: fn.startLine,
        endLine: fn.endLine,
        opcodeCount: fn.opcodeCount,
      });
    }
  }

  // -------------------------------------------------------------------------
  // Step 4: Compute 75th-percentile threshold across all repository functions
  // -------------------------------------------------------------------------
  const p75 = percentile(
    allFunctions.map((f) => f.opcodeCount),
    75,
  );

  // -------------------------------------------------------------------------
  // Step 5: Identify hot functions and compute their per-function StorageOps
  // -------------------------------------------------------------------------
  const hotFunctions: HotFunction[] = allFunctions
    .filter((f) => f.opcodeCount >= p75)
    .map((f) => ({
      fileName: f.fileName,
      functionName: f.name,
      opcodeCount: f.opcodeCount,
      storageOps: computeFunctionStorageOps(f.source, f.startLine, f.endLine),
    }))
    .sort((a, b) => b.opcodeCount - a.opcodeCount);

  return {
    files: fileResults,
    totalOpcodes,
    totalStorageOps,
    hotFunctions,
  };
}
