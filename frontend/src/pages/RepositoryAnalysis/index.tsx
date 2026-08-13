import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import { analyzeTealQuick, analyzeTealDeep, analyzeTealRepo } from '@/services/api/analysis';
import type { TealAnalysisResult, OptimizationReport, RepoOptimizationReport } from '@/types';
import { Play, Wallet, AlertCircle, CheckCircle2, Upload, Folder } from 'lucide-react';
import clsx from 'clsx';
import { SwissButton } from '@/components/swiss/SwissButton';
import { SwissCard } from '@/components/swiss/SwissCard';
import { SwissSectionHeader } from '@/components/swiss/SwissSectionHeader';

const DEFAULT_TEAL = `txn Sender
int 1
return
`;

const MOCK_REPO = [
  {
    fileName: 'app_approval.teal',
    source: `#pragma version 8
txn ApplicationID
int 0
==
bnz handle_create
txn OnCompletion
int NoOp
==
bnz handle_noop
err

handle_create:
int 1
return

handle_noop:
// A hot function with lots of redundant storage ops
byte "key1"
app_global_get
byte "key2"
app_global_get
byte "key1"
app_global_get
int 1
return`
  },
  {
    fileName: 'app_clear.teal',
    source: `#pragma version 8
int 1
return`
  },
  {
    fileName: 'utils.teal',
    source: `#pragma version 8
math_helper:
// Not a hot function
int 2
int 2
+
return`
  }
];


export default function RepositoryAnalysis() {
  const { activeAddress, signTransactions, wallets } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [source, setSource] = useState(DEFAULT_TEAL);
  const [repoFiles, setRepoFiles] = useState<{fileName: string, source: string}[]>(MOCK_REPO);
  const [analyzing, setAnalyzing] = useState(false);
  const [deepAnalyzing, setDeepAnalyzing] = useState(false);
  const [repoAnalyzing, setRepoAnalyzing] = useState(false);
  const [result, setResult] = useState<TealAnalysisResult | null>(null);
  const [deepResult, setDeepResult] = useState<OptimizationReport | null>(null);
  const [repoResult, setRepoResult] = useState<RepoOptimizationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // We only support TestNet ALGORAND and USDC in this example
  const TESTNET_USDC_ASSET_ID = 10458941;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    setResult(null);
    setDeepResult(null);
    setRepoResult(null);

    try {
      // First attempt (no payment)
      const res = await analyzeTealQuick({ source, fileName: 'example.teal' });
      setResult(res);
    } catch (err: any) {
      if (err.response?.status === 402 && err.paymentRequirements) {
        // Handle x402 payment
        try {
          const payload = await handlePaymentFlow(err.paymentRequirements);
          const resRetry = await analyzeTealQuick({ source, fileName: 'example.teal' }, payload);
          setResult(resRetry);
        } catch (paymentErr: any) {
          setError(`Payment failed or rejected: ${paymentErr.message}`);
        }
      } else {
        setError(err.message || 'An error occurred during analysis');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeepAnalyze = async () => {
    setDeepAnalyzing(true);
    setError(null);
    setResult(null);
    setDeepResult(null);
    setRepoResult(null);

    try {
      // First attempt (no payment)
      const res = await analyzeTealDeep({ source, fileName: 'example.teal' });
      setDeepResult(res);
    } catch (err: any) {
      if (err.response?.status === 402 && err.paymentRequirements) {
        try {
          const payload = await handlePaymentFlow(err.paymentRequirements);
          const resRetry = await analyzeTealDeep({ source, fileName: 'example.teal' }, payload);
          setDeepResult(resRetry);
        } catch (paymentErr: any) {
          setError(`Payment failed or rejected: ${paymentErr.message}`);
        }
      } else {
        setError(err.message || 'An error occurred during deep analysis');
      }
    } finally {
      setDeepAnalyzing(false);
    }
  };

  const handleRepoAnalyze = async () => {
    setRepoAnalyzing(true);
    setError(null);
    setResult(null);
    setDeepResult(null);
    setRepoResult(null);

    const payloadFiles = { files: repoFiles };

    try {
      const res = await analyzeTealRepo(payloadFiles);
      setRepoResult(res);
    } catch (err: any) {
      if (err.response?.status === 402 && err.paymentRequirements) {
        try {
          const payload = await handlePaymentFlow(err.paymentRequirements);
          const resRetry = await analyzeTealRepo(payloadFiles, payload);
          setRepoResult(resRetry);
        } catch (paymentErr: any) {
          setError(`Payment failed or rejected: ${paymentErr.message}`);
        }
      } else {
        setError(err.message || 'An error occurred during repo analysis');
      }
    } finally {
      setRepoAnalyzing(false);
    }
  };

  const handlePaymentFlow = async (requirements: any): Promise<any> => {
    if (!activeAddress) {
      throw new Error('Wallet not connected. Please connect your wallet to pay.');
    }

    try {
      // Initialize Algod client for TestNet to get suggested params
      const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
      
      // Adapt useWallet signTransactions to AvmSigner interface expected by x402-avm
      const avmSigner = {
        address: activeAddress,
        signTransactions: async (txns: Uint8Array[], indexesToSign: number[]) => {
          // Fix for algosdk v2/v3 mismatch where x402-avm fails to compute indexes
          if (indexesToSign.length === 0) {
            indexesToSign = txns.map((t, i) => {
              try {
                const decoded = algosdk.decodeUnsignedTransaction(t);
                // algosdk v2 structure
                const sender = algosdk.encodeAddress(decoded.from.publicKey);
                return sender === activeAddress ? i : -1;
              } catch (err) {
                return -1;
              }
            }).filter(i => i !== -1);
          }

          const signed = await signTransactions(txns, indexesToSign);
          
          // useWallet usually returns the full array with nulls for unsigned indices
          if (signed.length === txns.length) {
            return signed;
          }
          
          // Fallback if it returns only the signed ones
          let signedIndex = 0;
          return txns.map((_, i) => indexesToSign.includes(i) && signed ? signed[signedIndex++] : null);
        }
      };

      // We dynamically import to avoid breaking builds if it's not present during initial parse
      const { x402Client } = await import('@x402-avm/core/client');
      const { registerExactAvmScheme } = await import('@x402-avm/avm/exact/client');

      const client = new x402Client();
      registerExactAvmScheme(client, { 
        signer: avmSigner, 
        algodConfig: { client: algodClient } 
      });

      // Generate the full payload automatically (including fee-payer and transaction grouping)
      const payload = await client.createPaymentPayload(requirements);
      console.log('[x402] Full payment payload to submit:', JSON.stringify(payload, null, 2));
      return payload;
    } catch (e: any) {
      throw new Error(`Txn prep failed. from: "${activeAddress}", error: ${e.message}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    // Filter out non-code files if necessary, or just read all. For now we read all files as text.
    const readPromises = files.map(file => {
      return new Promise<{fileName: string, source: string}>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            fileName: file.webkitRelativePath || file.name,
            source: event.target?.result as string
          });
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    });

    try {
      const results = await Promise.all(readPromises);
      // Filter out files that might be binary or empty (optional), for now just set them
      const tealFiles = results.filter(r => r.source.trim().length > 0);
      if (tealFiles.length > 0) {
        setRepoFiles(tealFiles);
        // Optionally update the single-file editor to show the first uploaded file
        setSource(tealFiles[0].source);
        setError(null);
      } else {
        setError('No valid text files found in the selected folder.');
      }
    } catch (err) {
      setError('Failed to read uploaded files.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-t-4 border-black">
      
      {/* Left Column (Editor Panel) */}
      <div className="lg:col-span-5 border-r-0 lg:border-r-4 border-black bg-white flex flex-col h-auto lg:h-[calc(100vh-10rem)]">
        <div className="p-6 md:p-8 flex-1 flex flex-col min-h-0">
          <SwissSectionHeader prefix="01. INPUT" title="TEAL Analysis" size="large" />
          
          <div className="flex-1 relative border-4 border-black flex flex-col min-h-[400px] lg:min-h-0 bg-white">
            <div className="absolute inset-0 swiss-grid-pattern opacity-50 pointer-events-none" />
            <div className="flex items-center justify-between p-3 border-b-4 border-black bg-black text-white">
              <span className="font-mono text-sm font-bold uppercase tracking-wider">example.teal</span>
            </div>
            <div className="flex-1 relative z-10 p-2">
              <Editor
                height="100%"
                defaultLanguage="plaintext"
                theme="light"
                value={source}
                onChange={(val) => setSource(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>
          
          <div className="mt-6 flex flex-col gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
              className="hidden"
              // @ts-ignore
              webkitdirectory="true"
              directory="true"
              multiple
            />
            <div className="grid grid-cols-2 gap-3">
              <SwissButton
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing || deepAnalyzing || repoAnalyzing}
                variant="secondary"
              >
                <Folder className="w-4 h-4" />
                Upload Folder
              </SwissButton>
              <SwissButton
                onClick={handleRepoAnalyze}
                disabled={analyzing || deepAnalyzing || repoAnalyzing || repoFiles.length === 0}
                variant="accent"
              >
                <Play className="w-4 h-4" />
                {repoAnalyzing ? 'Repo AI...' : `Repo ($0.05) - ${repoFiles.length} F`}
              </SwissButton>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <SwissButton
                onClick={handleAnalyze}
                disabled={analyzing || deepAnalyzing}
                variant="primary"
              >
                <Play className="w-4 h-4" />
                {analyzing ? 'Analyzing...' : 'Quick ($0.01)'}
              </SwissButton>
              <SwissButton
                onClick={handleDeepAnalyze}
                disabled={analyzing || deepAnalyzing || repoAnalyzing}
                variant="accent"
              >
                <Play className="w-4 h-4" />
                {deepAnalyzing ? 'AI...' : 'Deep AI ($0.05)'}
              </SwissButton>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Results Panel) */}
      <div className="lg:col-span-7 bg-white h-auto lg:h-[calc(100vh-10rem)] overflow-y-auto">
        <div className="p-6 md:p-8 space-y-12">
          
          {/* Default State */}
          {!result && !deepResult && !repoResult && !error && !analyzing && !deepAnalyzing && !repoAnalyzing && (
             <div className="h-64 flex items-center justify-center border-4 border-black swiss-diagonal">
               <span className="bg-white px-6 py-3 border-2 border-black font-bold uppercase tracking-widest text-sm">Waiting for input...</span>
             </div>
          )}

          {/* Loaders */}
          {(analyzing || deepAnalyzing || repoAnalyzing) && (
             <div className="h-64 flex items-center justify-center border-4 border-black bg-black text-white p-6 text-center">
               <span className="animate-pulse font-bold uppercase tracking-widest text-xl">
                 {(deepAnalyzing || repoAnalyzing) ? "AI ORCHESTRATION IN PROGRESS..." : "STATIC ANALYSIS IN PROGRESS..."}
               </span>
             </div>
          )}
          
          {/* Error */}
          {error && (
             <SwissCard borderWidth="thick" className="bg-swiss-red text-white border-black">
                <div className="flex gap-4 items-start">
                  <AlertCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold uppercase tracking-widest mb-2">Error Encountered</h3>
                    <p className="font-mono text-sm break-words">{error}</p>
                  </div>
                </div>
             </SwissCard>
          )}

          {/* Quick Analysis */}
          {result && (
            <div>
              <SwissSectionHeader prefix="02. STATIC ANALYSIS" title="METRICS" />
              <SwissCard borderWidth="thick" pattern="dots">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border-2 border-black p-4 bg-white">
                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Total Opcodes</div>
                    <div className="text-3xl font-black">{result.totalInstructions}</div>
                  </div>
                  <div className="border-2 border-black p-4 bg-white">
                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Global Storage</div>
                    <div className="text-3xl font-black">{result.storageOps.appGlobalGet + result.storageOps.appGlobalPut}</div>
                  </div>
                  <div className="border-2 border-black p-4 bg-white">
                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Local Storage</div>
                    <div className="text-3xl font-black">{result.storageOps.appLocalGet + result.storageOps.appLocalPut}</div>
                  </div>
                  <div className="border-2 border-black p-4 bg-white">
                    <div className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Box Storage</div>
                    <div className="text-3xl font-black">{result.storageOps.boxGet + result.storageOps.boxPut}</div>
                  </div>
                </div>
              </SwissCard>
            </div>
          )}

          {/* Deep Analysis */}
          {deepResult && (
            <div>
              <SwissSectionHeader prefix="03. AI OPTIMISATION REPORT" title="FINDINGS" />
              <div className="space-y-6">
                <div className="font-bold uppercase tracking-widest border-b-4 border-black pb-4 mb-8 text-xl">
                  TOTAL FINDINGS: {deepResult.findings.length}
                </div>
                
                {deepResult.findings.map((f, i) => (
                  <SwissCard key={i} borderWidth="thick" className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 pb-4 border-b-2 border-black gap-4">
                      <h4 className="font-black text-xl uppercase tracking-tight max-w-2xl leading-tight">{f.problem}</h4>
                      <span className={clsx(
                        "px-4 py-1 font-bold uppercase tracking-wider text-sm border-2 border-black whitespace-nowrap",
                        f.validationStatus === 'VALIDATED' ? "bg-black text-white" :
                        f.validationStatus === 'UNVERIFIED' ? "bg-yellow-400 text-black" :
                        "bg-swiss-red text-white"
                      )}>
                        {f.validationStatus}
                      </span>
                    </div>
                    
                    <p className="font-medium text-lg leading-relaxed mb-6">{f.reasoning}</p>
                    
                    {f.validationStatus !== 'REJECTED' && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="border-2 border-black p-4 bg-gray-50">
                          <span className="block text-xs font-bold uppercase tracking-widest mb-2">Opcodes</span>
                          <div className="flex items-center gap-4 text-2xl font-black">
                            <span className="line-through opacity-50">{f.metricBefore}</span>
                            <span>→</span>
                            <span>{f.metricAfter}</span>
                          </div>
                        </div>
                        <div className="border-2 border-black p-4 bg-gray-50">
                          <span className="block text-xs font-bold uppercase tracking-widest mb-2">Storage Ops</span>
                          <div className="flex items-center gap-4 text-2xl font-black">
                            <span className="line-through opacity-50">{f.storageOpsBefore}</span>
                            <span>→</span>
                            <span>{f.storageOpsAfter}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-4 border-black bg-black text-white p-4">
                      <h5 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Suggested Fix ({f.functionName})</h5>
                      <pre className="font-mono text-sm overflow-x-auto">
                        {f.suggestedCodeSnippet}
                      </pre>
                    </div>
                  </SwissCard>
                ))}
              </div>
            </div>
          )}

          {/* Repo Analysis */}
          {repoResult && (
            <div>
              <SwissSectionHeader prefix="03. REPOSITORY ANALYSIS" title="REPORT" />
              <div className="space-y-6">
                <SwissCard borderWidth="thick" pattern="diagonal" className="mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-black p-6 bg-white">
                      <div className="text-sm font-bold uppercase tracking-wider mb-2 text-gray-500">Files Analyzed</div>
                      <div className="text-5xl font-black">{repoResult.repoSummary.filesAnalyzed}</div>
                    </div>
                    <div className="border-2 border-black p-6 bg-black text-white">
                      <div className="text-sm font-bold uppercase tracking-wider mb-2 text-gray-400">Hot Functions</div>
                      <div className="text-5xl font-black">{repoResult.repoSummary.hotFunctionsCount}</div>
                    </div>
                  </div>
                </SwissCard>
                
                {repoResult.fileReports.map((report, fileIdx) => (
                  <div key={fileIdx} className="mb-12">
                    <h5 className="font-black text-2xl uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">
                      FILE: {report.fileName}
                    </h5>
                    
                    <div className="space-y-6">
                      {report.findings.length === 0 ? (
                        <div className="p-4 border-2 border-black font-bold uppercase tracking-widest text-sm">
                          No optimizable findings discovered.
                        </div>
                      ) : (
                        report.findings.map((f, i) => (
                          <SwissCard key={i} borderWidth="normal" className="border-black">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-6 pb-4 border-b-2 border-black gap-4">
                              <h4 className="font-black text-xl uppercase tracking-tight max-w-2xl leading-tight">{f.problem}</h4>
                              <span className={clsx(
                                "px-4 py-1 font-bold uppercase tracking-wider text-sm border-2 border-black whitespace-nowrap",
                                f.validationStatus === 'VALIDATED' ? "bg-black text-white" :
                                f.validationStatus === 'UNVERIFIED' ? "bg-yellow-400 text-black" :
                                "bg-swiss-red text-white"
                              )}>
                                {f.validationStatus}
                              </span>
                            </div>
                            
                            <p className="font-medium text-lg leading-relaxed mb-6">{f.reasoning}</p>
                            
                            {f.validationStatus !== 'REJECTED' && (
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="border-2 border-black p-4 bg-gray-50">
                                  <span className="block text-xs font-bold uppercase tracking-widest mb-2">Opcodes</span>
                                  <div className="flex items-center gap-4 text-2xl font-black">
                                    <span className="line-through opacity-50">{f.metricBefore}</span>
                                    <span>→</span>
                                    <span>{f.metricAfter}</span>
                                  </div>
                                </div>
                                <div className="border-2 border-black p-4 bg-gray-50">
                                  <span className="block text-xs font-bold uppercase tracking-widest mb-2">Storage Ops</span>
                                  <div className="flex items-center gap-4 text-2xl font-black">
                                    <span className="line-through opacity-50">{f.storageOpsBefore}</span>
                                    <span>→</span>
                                    <span>{f.storageOpsAfter}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="border-4 border-black bg-black text-white p-4">
                              <h5 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Suggested Fix ({f.functionName})</h5>
                              <pre className="font-mono text-sm overflow-x-auto">
                                {f.suggestedCodeSnippet}
                              </pre>
                            </div>
                          </SwissCard>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
