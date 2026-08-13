import type { Context } from 'hono';
import { analyzeRepository } from '../analysis/repository-orchestrator';
import { callSLM, validateFindings } from '../ai/orchestrator';
import type { ValidatedFinding } from '../ai/orchestrator';

export async function handleAnalyzeRepo(c: Context) {
  try {
    const body = await c.req.json();
    
    if (!Array.isArray(body.files)) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request body must contain "files" array containing {fileName, source}',
          },
        },
        400
      );
    }

    const files = body.files;
    const repoAnalysis = analyzeRepository(files);

    // Group hot functions by file to minimize duplicate lookups
    const hotFunctionsByFile = new Map<string, typeof repoAnalysis.hotFunctions>();
    for (const hf of repoAnalysis.hotFunctions) {
      if (!hotFunctionsByFile.has(hf.fileName)) {
        hotFunctionsByFile.set(hf.fileName, []);
      }
      hotFunctionsByFile.get(hf.fileName)!.push(hf);
    }

    const fileReports: Array<{ fileName: string, findings: ValidatedFinding[] }> = [];

    // Process each file that has hot functions
    for (const [fileName, hotFunctions] of hotFunctionsByFile.entries()) {
      const fileAnalysis = repoAnalysis.files.find(f => f.fileName === fileName)?.analysis;
      const fileSource = files.find(f => f.fileName === fileName)?.source;
      
      if (!fileAnalysis || !fileSource) continue;
      
      const sourceLines = fileSource.replace(/\r\n/g, '\n').split('\n');

      let allFileFindings: ValidatedFinding[] = [];

      for (const hf of hotFunctions) {
        // Find the function details in the file analysis
        const funcAnalysis = fileAnalysis.functions.find(f => f.name === hf.functionName);
        if (!funcAnalysis) continue;

        // Build a single-function context specifically for this hot function
        const contextObj = {
          fileName: fileName,
          totalOpcodeCount: fileAnalysis.totalInstructions,
          storageOps: fileAnalysis.storageOps,
          hotFunction: {
            name: funcAnalysis.name,
            startLine: funcAnalysis.startLine,
            endLine: funcAnalysis.endLine,
            opcodeCount: funcAnalysis.opcodeCount,
            sourceLines: sourceLines.slice(funcAnalysis.startLine - 1, funcAnalysis.endLine),
          }
        };

        const contextJson = JSON.stringify(contextObj, null, 2);

        // Call SLM for this specific function block
        const rawFindings = await callSLM(contextJson);

        // Validate findings against the full file
        const validated = validateFindings(fileSource, fileAnalysis, rawFindings);
        allFileFindings.push(...validated);
      }
      
      fileReports.push({
        fileName,
        findings: allFileFindings,
      });
    }

    return c.json({
      repoSummary: {
        totalOpcodes: repoAnalysis.totalOpcodes,
        totalStorageOps: repoAnalysis.totalStorageOps,
        filesAnalyzed: files.length,
        hotFunctionsCount: repoAnalysis.hotFunctions.length,
      },
      fileReports
    });
  } catch (error) {
    console.error('[handleAnalyzeRepo] Error:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during repository analysis orchestration',
        },
      },
      500
    );
  }
}
