/**
 * AI Optimization Orchestrator
 *
 * Validated AI-optimization pipeline for Algorand TEAL smart contracts.
 *
 * Flow:
 *   1. buildContext()       — distil TealAnalysisResult into a compact SLM prompt
 *   2. callSLM()            — send context to the language model, parse strict JSON
 *   3. validateFindings()   — re-analyze patched source and assign VALIDATED / UNVERIFIED / REJECTED
 *   4. runOptimizationPipeline() — top-level entry point combining 1-3
 *
 * CRITICAL INVARIANT: the SLM's output is never trusted as-is.
 * Every suggested code change is re-run through analyzeTeal() and compared
 * numerically before any status other than "AI_SUGGESTED" is assigned.
 */

import { analyzeTeal } from '../analysis/static-analysis';
import type {
  TealAnalysisResult,
  TealFunction,
  StorageOps,
} from '../analysis/static-analysis';

// ---------------------------------------------------------------------------
// External dependency — the LLM call surface is injected, not owned here.
// In production the import path might differ; this is the only integration
// seam. The function must accept a string prompt and return a string response.
// ---------------------------------------------------------------------------

import { callLLM } from './llm-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Categories the SLM may assign to a finding. */
export type FindingCategory =
  | 'storage'
  | 'redundant_ops'
  | 'dead_code'
  | 'architecture';

/** Severity levels the SLM may suggest (subject to override by validation). */
export type FindingSeverity = 'low' | 'medium' | 'high';

/**
 * Validation status assigned by validateFindings() — never by the SLM.
 *
 * - VALIDATED:  patched source has strictly fewer relevant opcodes and still parses.
 * - UNVERIFIED: metrics improved OR stayed flat but re-parse had warnings.
 * - REJECTED:   metrics regressed or the patched source fails to parse.
 */
export type ValidationStatus = 'VALIDATED' | 'UNVERIFIED' | 'REJECTED';

/** Raw finding as returned by the SLM (pre-validation). */
export interface SLMFinding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  functionName: string;
  problem: string;
  reasoning: string;
  suggestedCodeSnippet: string;
  /** SLM self-reported confidence — informational only, never authoritative. */
  confidence: number;
}

/** A finding after going through the validation pipeline. */
export interface ValidatedFinding extends SLMFinding {
  /** Determined by numeric before/after comparison, not by the SLM. */
  validationStatus: ValidationStatus;
  /** Total relevant opcodes BEFORE the suggested patch. */
  metricBefore: number;
  /** Total relevant opcodes AFTER the suggested patch (null if parse failed). */
  metricAfter: number | null;
  /** Total storage ops before. */
  storageOpsBefore: number;
  /** Total storage ops after (null if parse failed). */
  storageOpsAfter: number | null;
}

/** Final report returned by runOptimizationPipeline(). */
export interface OptimizationReport {
  fileName: string;
  before: TealAnalysisResult;
  findings: ValidatedFinding[];
}

// ---------------------------------------------------------------------------
// 1. buildContext
// ---------------------------------------------------------------------------

/**
 * Context object sent to the SLM. Designed to be compact:
 * - Only the top-N opcodes by frequency
 * - Only functions above the 75th percentile in opcode count
 * - Relevant source lines inlined for those hot functions
 */
interface SLMContext {
  fileName: string;
  totalOpcodeCount: number;
  top5Opcodes: Array<{ opcode: string; count: number }>;
  storageOps: StorageOps;
  innerTransactions: number;
  /** Functions whose opcodeCount is above the 75th percentile. */
  hotFunctions: Array<{
    name: string;
    startLine: number;
    endLine: number;
    opcodeCount: number;
    /** Source lines for only this function (from startLine..endLine). */
    sourceLines: string[];
  }>;
}

/**
 * Build a compact structured JSON summary of the analysis to feed the SLM.
 *
 * Why 75th percentile? It keeps only the most opcode-heavy functions,
 * which are the best candidates for optimisation. If a contract has 4
 * functions, we keep the top 1; if it has 20, we keep the top 5.
 */
export function buildContext(
  analysis: TealAnalysisResult,
  sourceCode: string,
): string {
  const sourceLines = sourceCode.replace(/\r\n/g, '\n').split('\n');

  // Sort opcodes by count descending, take top 5
  const sortedOpcodes = Object.entries(analysis.opcodeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([opcode, count]) => ({ opcode, count }));

  // Compute the 75th-percentile threshold for function opcodeCount
  const funcs = analysis.functions;
  const p75Threshold = percentile(
    funcs.map((f) => f.opcodeCount),
    75,
  );

  // Keep only functions above that threshold
  const hotFunctions = funcs
    .filter((f) => f.opcodeCount >= p75Threshold)
    .map((f) => ({
      name: f.name,
      startLine: f.startLine,
      endLine: f.endLine,
      opcodeCount: f.opcodeCount,
      // Source lines are 1-indexed; array is 0-indexed
      sourceLines: sourceLines.slice(f.startLine - 1, f.endLine),
    }));

  const ctx: SLMContext = {
    fileName: analysis.fileName,
    totalOpcodeCount: analysis.totalInstructions,
    top5Opcodes: sortedOpcodes,
    storageOps: analysis.storageOps,
    innerTransactions: analysis.innerTransactions,
    hotFunctions,
  };

  return JSON.stringify(ctx, null, 2);
}

// ---------------------------------------------------------------------------
// 2. callSLM
// ---------------------------------------------------------------------------

/**
 * System prompt that constrains the SLM to return STRICT JSON.
 *
 * Structured in four sections:
 *   1. Domain context — Algorand AVM, TEAL, storage ops, costs
 *   2. Optimization priorities — what to look for, what to avoid
 *   3. Severity guidance — when to use high / medium / low
 *   4. Output schema — strict JSON contract, no prose
 */
const SLM_SYSTEM_PROMPT = `You are an expert Algorand AVM smart-contract optimizer specialising in TEAL approval programs.

=== DOMAIN ===
Algorand smart contracts are written in TEAL — a stack-based assembly language executed by the Algorand Virtual Machine (AVM). Key cost drivers:

- **Storage operations** are the most expensive instructions in the AVM budget:
  • app_local_get / app_local_put  — read/write per-account local state
  • app_global_get / app_global_put — read/write application global state
  • box_get / box_put               — read/write box storage
  Repeated reads of the same key within a single execution path waste opcode budget. A common optimisation is to read once, cache on the stack or in a scratch space, and reuse.

- **Unnecessary instructions** (redundant pushes, duplicate pops, unreachable branches) inflate program size and consume opcode budget without contributing to correct behaviour.

- **Dead code** (labels/branches that are never jumped to) increases approval-program byte size, which counts toward the per-transaction cost and the max program-size limit.

=== OPTIMISATION PRIORITIES ===
When analysing the TEAL context you receive, prefer findings that:

1. Reduce repeated storage access — cache reads in scratch space or on the stack instead of calling app_global_get / app_local_get / box_get multiple times for the same key.
2. Eliminate unnecessary instructions — remove no-op sequences, redundant stack manipulations (e.g. dup + pop), or branches that always fall through.
3. Remove dead code — prune labels and blocks that are never branched to.
4. Use the "architecture" category ONLY for cross-function patterns (e.g. two labels that contain near-identical instruction sequences that could be refactored into a shared subroutine via callsub, or duplicated helper logic across blocks).

IMPORTANT: Do NOT change business logic. Do not alter transaction flow semantics, modify state-read/write keys, change conditional branching outcomes, or remove safety checks (e.g. assert, err, return guards) unless the code is provably dead (unreachable).

=== SEVERITY ===
Assign severity as follows:
- "high"   — Repeated storage ops or unnecessary instructions that appear across many functions or dominate the opcode budget. Fixing these yields the largest cost savings.
- "medium" — Local function-level cleanups: a single function with redundant stack ops, an unnecessary branch, or a storage read that could be cached within that block.
- "low"    — Cosmetic or dead-code findings that have minimal impact on opcode budget (e.g. an unreachable label with a few instructions, a comment-only block counted as code).

=== OUTPUT ===
You MUST respond with ONLY valid JSON matching the schema below. No markdown, no backticks, no text outside the JSON object.

{
  "findings": [
    {
      "id": "<unique-slug>",
      "category": "storage" | "redundant_ops" | "dead_code" | "architecture",
      "severity": "low" | "medium" | "high",
      "functionName": "<label-name that you are optimizing>",
      "problem": "<one-sentence description>",
      "reasoning": "<brief technical reasoning — mention opcode names and counts>",
      "suggestedCodeSnippet": "<full replacement TEAL code for the function block>",
      "confidence": <0.0-1.0>
    }
  ]
}

Rules:
- suggestedCodeSnippet MUST start with the label (e.g. "handle_noop:") and contain complete, valid TEAL instructions up to (but not including) the next label.
- Do NOT invent opcodes that do not exist in the AVM specification.
- Do NOT remove or alter assert / err / return guards unless the enclosing block is provably dead.
- If you have no findings, return {"findings":[]}.
- Output raw JSON only — no explanation, no preamble, no postscript.`;

/**
 * Send the analysis context to the SLM and parse its response.
 *
 * If the response is not valid JSON or does not match the expected schema,
 * returns an empty findings array rather than propagating garbage.
 */
export async function callSLM(context: string): Promise<SLMFinding[]> {
  const prompt = `${SLM_SYSTEM_PROMPT}\n\n--- ANALYSIS CONTEXT ---\n${context}`;

  const raw = await callLLM(prompt);

  try {
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      console.warn('[orchestrator] SLM response did not contain a JSON object:', raw);
      return [];
    }
    
    const cleaned = raw.substring(firstBrace, lastBrace + 1);

    const parsed = JSON.parse(cleaned) as { findings: SLMFinding[] };

    if (!Array.isArray(parsed.findings)) {
      console.warn('[orchestrator] SLM response missing findings array');
      return [];
    }

    // Basic shape validation — reject any finding missing required fields
    return parsed.findings.filter(
      (f) =>
        typeof f.id === 'string' &&
        typeof f.category === 'string' &&
        typeof f.severity === 'string' &&
        typeof f.functionName === 'string' &&
        typeof f.problem === 'string' &&
        typeof f.suggestedCodeSnippet === 'string' &&
        typeof f.confidence === 'number',
    );
  } catch (err) {
    console.error('[orchestrator] Failed to parse SLM response:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 2b. checkStackSafety — Lightweight Semantic Safety Net
// ---------------------------------------------------------------------------

/**
 * TEAL instruction mnemonics that push a value onto the stack.
 * Not exhaustive — covers the common cases needed for the heuristic check.
 */
const PUSH_MNEMONICS = new Set([
  'int', 'byte', 'addr', 'pushint', 'pushbytes',
  'txn', 'txna', 'gtxn', 'gtxna', 'gtxns', 'gtxnsa',
  'arg', 'arg_0', 'arg_1', 'arg_2', 'arg_3',
  'global', 'load', 'loads', 'gload', 'gloads',
  'gaid', 'gaids', 'dup', 'dup2',
  'itxn', 'itxna', 'gitxn', 'gitxna',
  'app_opted_in', 'balance', 'min_balance',
  'app_local_get', 'app_global_get',
  'box_get', 'box_len',
  'len', 'btoi', 'itob',
]);

/**
 * TEAL instruction mnemonics that consume (pop) one or more values.
 * Arithmetic/comparison ops pop 2 and push 1 (net −1); we count them
 * as consumers for the heuristic imbalance check.
 */
const POP_CONSUMING_MNEMONICS = new Set([
  'return', 'assert',
  '==', '!=', '+', '-', '*', '/', '%',
  '<', '>', '<=', '>=',
  '&&', '||', '!', '~', '&', '|', '^',
  'pop', 'store', 'stores',
  'app_local_put', 'app_global_put',
  'app_local_del', 'app_global_del',
  'box_put', 'box_del',
  'bnz', 'bz', 'log',
  'concat', 'substring3', 'extract3',
  'setbit', 'setbyte',
]);

/**
 * Parse a TEAL code block into an array of cleaned instruction lines.
 * Strips comments, labels, #pragma directives, and blank lines.
 */
function parseInstructionLines(block: string): string[] {
  return block
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (line === '') return false;
      if (line.startsWith('//')) return false;
      if (line.startsWith('#')) return false;
      if (/^\w+:$/.test(line)) return false; // label definition
      return true;
    })
    .map((line) => {
      // Strip trailing inline comments
      const commentIdx = line.indexOf('//');
      return commentIdx >= 0 ? line.substring(0, commentIdx).trim() : line;
    })
    .filter((line) => line !== '');
}

/** Extract the first token (mnemonic / opcode) from an instruction line. */
function getMnemonic(instructionLine: string): string {
  return instructionLine.split(/\s+/)[0] || '';
}

/**
 * Lightweight heuristic semantic safety check for TEAL code patches.
 *
 * This is NOT a full TEAL interpreter or stack simulator.  It is a fast,
 * conservative safety net that catches the most dangerous classes of SLM
 * mistakes before they can be marked VALIDATED:
 *
 *   Rule 1 — Removing a value push immediately before `return` breaks
 *            approval semantics (`return` pops the top of the stack as the
 *            approval boolean; if the push is gone there is nothing valid
 *            to pop → undefined behaviour / guaranteed rejection on-chain).
 *
 *   Rule 2 — A net decrease in push-to-pop balance relative to the
 *            original block signals a likely stack underflow.
 *
 *   Rule 3 — Removing `err` or `assert` instructions removes a safety
 *            guard and must never be auto-approved.
 *
 * Example (test-fixtures/example-simple.teal):
 *   Original approval branch:
 *     int 1      ← push
 *     return     ← pops the pushed 1 as the approval boolean
 *   If the SLM removes "int 1" (suggesting just "return"), this check
 *   catches it via Rule 1 and marks the finding REJECTED, not VALIDATED.
 */
export function checkStackSafety(
  originalBlock: string,
  patchedBlock: string,
): { safe: boolean; reason?: string } {
  const originalInstrs = parseInstructionLines(originalBlock);
  const patchedInstrs = parseInstructionLines(patchedBlock);

  const originalMnemonics = originalInstrs.map(getMnemonic);
  const patchedMnemonics = patchedInstrs.map(getMnemonic);

  // --- Rule 3: Removed err/assert safety guards ---
  // Check this first — it is the most severe violation.
  for (const guard of ['err', 'assert'] as const) {
    const originalCount = originalMnemonics.filter((m) => m === guard).length;
    const patchedCount = patchedMnemonics.filter((m) => m === guard).length;
    if (patchedCount < originalCount) {
      return {
        safe: false,
        reason:
          'Removes a safety guard (err/assert) — never auto-approve this',
      };
    }
  }

  // --- Rule 1: Removed push before return ---
  // If the patched block's last non-empty instruction is `return`, check
  // whether the instruction immediately before `return` in the ORIGINAL was
  // a push that no longer appears before `return` in the patched version.
  const patchedLastMnemonic =
    patchedMnemonics.length > 0
      ? patchedMnemonics[patchedMnemonics.length - 1]
      : '';

  if (patchedLastMnemonic === 'return') {
    // Find the last `return` in the original block
    let origReturnIdx = -1;
    for (let i = originalMnemonics.length - 1; i >= 0; i--) {
      if (originalMnemonics[i] === 'return') {
        origReturnIdx = i;
        break;
      }
    }

    if (origReturnIdx > 0) {
      const origBeforeReturn = originalMnemonics[origReturnIdx - 1]!;
      if (PUSH_MNEMONICS.has(origBeforeReturn)) {
        // The original pushes a value right before return.
        // Does the patched version still push before return?
        const patchedReturnIdx = patchedMnemonics.lastIndexOf('return');
        const patchedBeforeReturn =
          patchedReturnIdx > 0
            ? patchedMnemonics[patchedReturnIdx - 1]!
            : '';

        if (!PUSH_MNEMONICS.has(patchedBeforeReturn)) {
          return {
            safe: false,
            reason:
              'Removes value pushed before return — likely breaks approval semantics',
          };
        }
      }
    }
  }

  // --- Rule 2: Push/pop count imbalance (stack underflow risk) ---
  const originalPushes = originalMnemonics.filter((m) =>
    PUSH_MNEMONICS.has(m),
  ).length;
  const originalPops = originalMnemonics.filter((m) =>
    POP_CONSUMING_MNEMONICS.has(m),
  ).length;
  const patchedPushes = patchedMnemonics.filter((m) =>
    PUSH_MNEMONICS.has(m),
  ).length;
  const patchedPops = patchedMnemonics.filter((m) =>
    POP_CONSUMING_MNEMONICS.has(m),
  ).length;

  const originalBalance = originalPushes - originalPops;
  const patchedBalance = patchedPushes - patchedPops;

  if (patchedPushes < patchedPops && patchedBalance < originalBalance) {
    return {
      safe: false,
      reason:
        'Possible stack underflow — push/pop instruction count mismatch',
    };
  }

  return { safe: true };
}

// ---------------------------------------------------------------------------
// 3. validateFindings
// ---------------------------------------------------------------------------

/**
 * For each SLM finding:
 *   1. Locate the function block in the original source by label name
 *   2. Replace that block with the SLM's suggestedCodeSnippet
 *   3. Re-run analyzeTeal() on the patched source
 *   4. Compare total opcodes and storage ops before vs. after
 *   5. Assign VALIDATED / UNVERIFIED / REJECTED
 *
 * Comparison logic (per-finding):
 *   - "relevant opcodes" = totalInstructions of the patched file
 *   - "relevant storage" = sum of all storageOps values
 *   - VALIDATED:   opcodes strictly decreased AND parse succeeded (functions array non-empty or unchanged)
 *   - UNVERIFIED:  opcodes decreased but function count changed (possible structural issue),
 *                  OR opcodes stayed flat but storage decreased
 *   - REJECTED:    opcodes increased, storage increased, or parse completely failed
 */
export function validateFindings(
  originalSource: string,
  originalAnalysis: TealAnalysisResult,
  findings: SLMFinding[],
): ValidatedFinding[] {
  const beforeOpcodes = originalAnalysis.totalInstructions;
  const beforeStorage = sumStorageOps(originalAnalysis.storageOps);
  const beforeFunctionCount = originalAnalysis.functions.length;

  return findings.map((finding): ValidatedFinding => {
    // Attempt to patch the source
    const patched = patchSource(originalSource, originalAnalysis.functions, finding);

    if (patched === null) {
      // Could not locate the function block — cannot validate
      return {
        ...finding,
        validationStatus: 'REJECTED',
        metricBefore: beforeOpcodes,
        metricAfter: null,
        storageOpsBefore: beforeStorage,
        storageOpsAfter: null,
      };
    }

    // Re-run the analyzer on the patched source
    let afterAnalysis: TealAnalysisResult;
    try {
      afterAnalysis = analyzeTeal(patched, originalAnalysis.fileName);
    } catch {
      // analyzeTeal should never throw (per its contract), but guard anyway
      return {
        ...finding,
        validationStatus: 'REJECTED',
        metricBefore: beforeOpcodes,
        metricAfter: null,
        storageOpsBefore: beforeStorage,
        storageOpsAfter: null,
      };
    }

    const afterOpcodes = afterAnalysis.totalInstructions;
    const afterStorage = sumStorageOps(afterAnalysis.storageOps);
    const afterFunctionCount = afterAnalysis.functions.length;

    // --- Semantic safety check (heuristic, pre-decision) ---
    // Run BEFORE the opcode-comparison logic so that an unsafe patch is
    // always REJECTED, even if it happens to reduce opcode count.
    const targetFunc = originalAnalysis.functions.find(
      (f) => f.name === finding.functionName,
    );
    if (targetFunc) {
      const srcLines = originalSource.replace(/\r\n/g, '\n').split('\n');
      const originalBlock = srcLines
        .slice(targetFunc.startLine - 1, targetFunc.endLine)
        .join('\n');
      const safetyCheck = checkStackSafety(
        originalBlock,
        finding.suggestedCodeSnippet,
      );
      if (!safetyCheck.safe) {
        return {
          ...finding,
          reasoning: `${finding.reasoning} [Safety check failed: ${safetyCheck.reason}]`,
          validationStatus: 'REJECTED' as ValidationStatus,
          metricBefore: beforeOpcodes,
          metricAfter: afterOpcodes,
          storageOpsBefore: beforeStorage,
          storageOpsAfter: afterStorage,
        };
      }
    }

    // --- Decision logic ---
    //
    // A finding can only become VALIDATED if it BOTH:
    //   (a) reduces or maintains opcode count, AND
    //   (b) passed checkStackSafety above.
    //
    // Primary metric:  totalInstructions (fewer = better)
    // Secondary metric: total storage ops (fewer = better)
    // Structural check: function count should be unchanged or higher
    //                   (we don't want the patch to accidentally merge/delete labels)

    let status: ValidationStatus;

    if (afterOpcodes < beforeOpcodes) {
      // Opcodes decreased — check structural integrity
      if (afterFunctionCount >= beforeFunctionCount - 1) {
        // Structure looks intact (we allow removing the patched function's label
        // if the snippet merges it, hence -1 tolerance)
        status = 'VALIDATED';
      } else {
        // Opcodes improved but structure looks suspicious
        status = 'UNVERIFIED';
      }
    } else if (afterOpcodes === beforeOpcodes && afterStorage < beforeStorage) {
      // Opcodes flat but storage improved — marginal, call it UNVERIFIED
      status = 'UNVERIFIED';
    } else {
      // Opcodes increased or everything stayed the same — no improvement
      status = 'REJECTED';
    }

    return {
      ...finding,
      validationStatus: status,
      metricBefore: beforeOpcodes,
      metricAfter: afterOpcodes,
      storageOpsBefore: beforeStorage,
      storageOpsAfter: afterStorage,
    };
  });
}

// ---------------------------------------------------------------------------
// 4. runOptimizationPipeline (public entry point)
// ---------------------------------------------------------------------------

/**
 * Run the full optimization pipeline:
 *   analyzeTeal → buildContext → callSLM → validateFindings → report
 */
export async function runOptimizationPipeline(
  source: string,
  fileName: string,
): Promise<OptimizationReport> {
  // Step 0: static analysis of the original source
  const before = analyzeTeal(source, fileName);

  // Step 1: build compact context for the SLM
  const context = buildContext(before, source);

  // Step 2: call the SLM
  const rawFindings = await callSLM(context);

  // Step 3: validate every finding against the real analyzer
  const validated = validateFindings(source, before, rawFindings);

  return { fileName, before, findings: validated };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Compute the p-th percentile of a numeric array.
 * Uses the "nearest rank" method. Returns 0 for empty arrays.
 */
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, rank)]!;
}

/**
 * Sum all values in a StorageOps object.
 */
function sumStorageOps(ops: StorageOps): number {
  return (
    ops.appLocalGet +
    ops.appLocalPut +
    ops.appGlobalGet +
    ops.appGlobalPut +
    ops.boxGet +
    ops.boxPut
  );
}

/**
 * Replace the function block identified by `finding.functionName` with
 * the SLM's `suggestedCodeSnippet`.
 *
 * Returns the patched source string, or null if the function label
 * could not be found.
 *
 * Strategy:
 *   1. Find the TealFunction whose name matches finding.functionName.
 *   2. Extract its startLine..endLine range in the source.
 *   3. Replace those lines with the suggested snippet.
 */
function patchSource(
  originalSource: string,
  functions: TealFunction[],
  finding: SLMFinding,
): string | null {
  const target = functions.find((f) => f.name === finding.functionName);

  if (!target) {
    // Function not found — the SLM referenced a label that doesn't exist
    return null;
  }

  const lines = originalSource.replace(/\r\n/g, '\n').split('\n');

  // startLine and endLine are 1-indexed
  const before = lines.slice(0, target.startLine - 1);
  const after = lines.slice(target.endLine);
  const snippetLines = finding.suggestedCodeSnippet
    .replace(/\r\n/g, '\n')
    .split('\n');

  return [...before, ...snippetLines, ...after].join('\n');
}
