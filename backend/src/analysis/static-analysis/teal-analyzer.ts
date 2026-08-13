/**
 * TEAL Static Analyzer
 *
 * Parses AVM TEAL assembly source and extracts:
 *   - Per-opcode occurrence counts
 *   - Storage operation breakdown (local/global/box get+put)
 *   - Inner transaction count
 *   - Total instruction count
 *   - Label-delimited pseudo-function boundaries with per-block opcode counts
 *
 * Design principles:
 *   - Pure function: no I/O, no side effects, deterministic output.
 *   - Never executes uploaded code — text parsing only.
 *   - Compatible with TEAL versions 2–10 (opcode set is extensible via
 *     the STORAGE_OPCODES and INNER_TX_OPCODES sets below).
 */

import type { TealAnalysisResult, TealFunction, StorageOps } from './types';

// ---------------------------------------------------------------------------
// Opcode sets for targeted tracking
// ---------------------------------------------------------------------------

/**
 * Opcodes that count toward storageOps.
 * Values are [field, increment-key] tuples matching the StorageOps interface.
 */
const STORAGE_OPCODE_MAP: Record<keyof StorageOps, string> = {
  appLocalGet: 'app_local_get',
  appLocalPut: 'app_local_put',
  appGlobalGet: 'app_global_get',
  appGlobalPut: 'app_global_put',
  boxGet: 'box_get',
  boxPut: 'box_put',
};

// Reverse lookup: opcode string → StorageOps key
const STORAGE_OPCODES: Map<string, keyof StorageOps> = new Map(
  Object.entries(STORAGE_OPCODE_MAP).map(([k, v]) => [v, k as keyof StorageOps])
);

/**
 * Opcodes that signal the beginning of an inner transaction group.
 * `itxn_begin` opens a group; each itxn_begin increments innerTransactions.
 */
const INNER_TX_BEGIN_OPCODE = 'itxn_begin';

// ---------------------------------------------------------------------------
// Line classification helpers
// ---------------------------------------------------------------------------

/**
 * Strip an inline comment from a token.
 * TEAL comments start with `//` anywhere on a line.
 */
function stripInlineComment(raw: string): string {
  const commentIdx = raw.indexOf('//');
  return commentIdx >= 0 ? raw.slice(0, commentIdx) : raw;
}

/**
 * Return true if the (trimmed, comment-stripped) line is a label definition.
 * TEAL labels: non-empty token ending in ':' with no whitespace inside.
 * Examples: `main:`, `handle_noop:`, `b64decode_loop:`
 */
function isLabel(token: string): boolean {
  return token.length > 1 && token.endsWith(':') && !token.includes(' ');
}

/**
 * Extract the label name from a label definition token (strips trailing ':').
 */
function labelName(token: string): string {
  return token.slice(0, -1);
}

/**
 * Return true if the trimmed line is a directive (starts with '#').
 * Directives (e.g. `#pragma version 8`) are not instructions.
 */
function isDirective(token: string): boolean {
  return token.startsWith('#');
}

// ---------------------------------------------------------------------------
// Main analyzer
// ---------------------------------------------------------------------------

/**
 * Analyze a TEAL source file and return structured metrics.
 *
 * @param source   Raw text content of the .teal file.
 * @param fileName Original file name (included verbatim in the result).
 * @returns        TealAnalysisResult — fully populated, never throws.
 */
export function analyzeTeal(source: string, fileName: string): TealAnalysisResult {
  const opcodeCounts: Record<string, number> = {};
  const storageOps: StorageOps = {
    appLocalGet: 0,
    appLocalPut: 0,
    appGlobalGet: 0,
    appGlobalPut: 0,
    boxGet: 0,
    boxPut: 0,
  };
  let innerTransactions = 0;
  let totalInstructions = 0;

  // -------------------------------------------------------------------------
  // First pass: split into lines, classify, count opcodes
  // -------------------------------------------------------------------------

  // Normalise line endings so we can split on \n safely on all platforms.
  const lines = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  // Track which 1-indexed lines are "instruction lines" (non-blank, non-comment,
  // non-directive, not a label) and which lines are label definitions.
  // We'll use this in the second pass to build TealFunction blocks.

  interface LineInfo {
    /** 1-indexed */
    lineNumber: number;
    /** Trimmed, comment-stripped first token */
    opcode: string;
    isLabelDef: boolean;
    isInstruction: boolean;
  }

  const lineInfos: LineInfo[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = stripInlineComment(lines[i]!).trim();

    // Blank or pure-comment line
    if (raw === '') {
      lineInfos.push({ lineNumber: i + 1, opcode: '', isLabelDef: false, isInstruction: false });
      continue;
    }

    // Directive (#pragma version N, etc.)
    if (isDirective(raw)) {
      lineInfos.push({ lineNumber: i + 1, opcode: raw, isLabelDef: false, isInstruction: false });
      continue;
    }

    // Label definition
    const firstToken = raw.split(/\s+/)[0] ?? '';
    if (isLabel(firstToken)) {
      lineInfos.push({ lineNumber: i + 1, opcode: labelName(firstToken), isLabelDef: true, isInstruction: false });
      continue;
    }

    // Regular instruction — first token is the opcode
    const opcode = firstToken.toLowerCase();
    lineInfos.push({ lineNumber: i + 1, opcode, isLabelDef: false, isInstruction: true });

    // Count opcode occurrences
    opcodeCounts[opcode] = (opcodeCounts[opcode] ?? 0) + 1;
    totalInstructions++;

    // Storage ops
    const storageKey = STORAGE_OPCODES.get(opcode);
    if (storageKey !== undefined) {
      storageOps[storageKey]++;
    }

    // Inner transactions
    if (opcode === INNER_TX_BEGIN_OPCODE) {
      innerTransactions++;
    }
  }

  // -------------------------------------------------------------------------
  // Second pass: build TealFunction blocks from label boundaries
  // -------------------------------------------------------------------------

  const functions: TealFunction[] = [];

  // Find indices (into lineInfos) where labels are defined.
  const labelIndices: number[] = lineInfos.reduce<number[]>((acc, li, idx) => {
    if (li.isLabelDef) acc.push(idx);
    return acc;
  }, []);

  for (let k = 0; k < labelIndices.length; k++) {
    const startIdx = labelIndices[k]!;
    // End of this block is the line before the next label, or the last line
    const endIdx = k + 1 < labelIndices.length ? labelIndices[k + 1]! - 1 : lineInfos.length - 1;

    const startLine = lineInfos[startIdx]!.lineNumber;
    // Walk backward from endIdx to find the last non-blank, non-comment line
    let lastInstructionIdx = endIdx;
    while (lastInstructionIdx > startIdx && !lineInfos[lastInstructionIdx]!.isInstruction) {
      lastInstructionIdx--;
    }
    const endLine = lineInfos[lastInstructionIdx]!.lineNumber;

    // Count instructions inside this block (exclusive of the label line itself)
    const opcodeCount = lineInfos
      .slice(startIdx + 1, endIdx + 1)
      .filter((li) => li.isInstruction)
      .length;

    functions.push({
      name: lineInfos[startIdx]!.opcode,
      startLine,
      endLine,
      opcodeCount,
    });
  }


  return {
    fileName,
    opcodeCounts,
    storageOps,
    innerTransactions,
    totalInstructions,
    functions,
  };
}
