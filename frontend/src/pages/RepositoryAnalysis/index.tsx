import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import { analyzeTealQuick } from '@/services/api/analysis';
import type { TealAnalysisResult } from '@/types';
import { Play, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const DEFAULT_TEAL = `txn Sender
int 1
return
`;

export default function RepositoryAnalysis() {
  const { activeAddress, signTransactions, wallets } = useWallet();
  const [source, setSource] = useState(DEFAULT_TEAL);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<TealAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // We only support TestNet ALGORAND and USDC in this example
  const TESTNET_USDC_ASSET_ID = 10458941;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // First attempt (no payment)
      const res = await analyzeTealQuick({ source, fileName: 'example.teal' });
      setResult(res);
    } catch (err: any) {
      if (err.response?.status === 402 && err.paymentRequirements) {
        // Handle x402 payment
        try {
          await handlePaymentFlow(err.paymentRequirements);
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

  const handlePaymentFlow = async (requirements: any) => {
    if (!activeAddress) {
      throw new Error('Wallet not connected. Please connect your wallet to pay.');
    }

    const { accepts } = requirements;
    // Find the exact scheme for ALGORAND_TESTNET_CAIP2
    const targetScheme = accepts.find((a: any) => 
      a.scheme === 'exact' && a.network === 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
    );

    if (!targetScheme) {
      throw new Error('No compatible payment scheme found for Algorand TestNet.');
    }

    const { payTo, amount, asset } = targetScheme;
    const amountNum = parseInt(amount, 10);

    // Initialize Algod client for TestNet to get suggested params
    // In production, use your own API node or AlgoNode
    const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
    const suggestedParams = await algodClient.getTransactionParams().do();

    let txn: algosdk.Transaction;

    try {
      if (asset && parseInt(asset, 10) > 0) {
        // Pay with ASA (USDC)
        txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: activeAddress,
          to: payTo,
          amount: amountNum,
          assetIndex: parseInt(asset, 10),
          suggestedParams,
        });
      } else {
        // Pay with ALGO
        txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: activeAddress,
          to: payTo,
          amount: amountNum,
          suggestedParams,
        });
      }
    } catch (e: any) {
      throw new Error(`Txn prep failed. payTo: "${payTo}", from: "${activeAddress}", error: ${e.message}, scheme: ${JSON.stringify(targetScheme)}`);
    }

    // Sign with wallet
    const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
    const signedTxns = await signTransactions([encodedTxn]);

    if (!signedTxns || signedTxns.length === 0) {
      throw new Error('User rejected the transaction signature.');
    }

    const signedTxnBytes = signedTxns[0];

    // Retry the request with the signed transaction in the X-Payment header
    const res = await analyzeTealQuick(
      { source, fileName: 'example.teal' },
      signedTxnBytes
    );

    setResult(res);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TEAL Analysis</h1>
        
        {/* Wallet Connection */}
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500">
            Debug: {wallets ? wallets.length : 'null'} wallets
          </div>
          {activeAddress ? (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Connected: {activeAddress.slice(0, 8)}...{activeAddress.slice(-4)}
            </div>
          ) : (
            wallets?.map((wallet) => (
              <button
                key={wallet.id}
                onClick={wallet.connect}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Wallet className="w-4 h-4" />
                Connect {wallet.metadata.name}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Section */}
        <div className="flex flex-col h-[600px] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">example.teal</span>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className={clsx(
                "inline-flex items-center gap-2 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white transition-colors",
                analyzing ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-sm"
              )}
            >
              <Play className="w-4 h-4" />
              {analyzing ? 'Analyzing...' : 'Analyze (Quick $0.01)'}
            </button>
          </div>
          <Editor
            height="100%"
            defaultLanguage="plaintext"
            theme="vs-dark"
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

        {/* Results Section */}
        <div className="flex flex-col h-[600px] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900 p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Analysis Results</h2>
          
          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex gap-3 text-red-800 dark:text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {!result && !error && !analyzing && (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
              Click Analyze to see static analysis results.
            </div>
          )}

          {analyzing && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {result && (
            <div className="space-y-6 text-sm text-gray-800 dark:text-gray-200">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Overview</h3>
                <ul className="space-y-1">
                  <li>Total Instructions: {result.totalInstructions}</li>
                  <li>Inner Transactions: {result.innerTransactions}</li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Storage Ops</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>Local Get: {result.storageOps.appLocalGet}</div>
                  <div>Local Put: {result.storageOps.appLocalPut}</div>
                  <div>Global Get: {result.storageOps.appGlobalGet}</div>
                  <div>Global Put: {result.storageOps.appGlobalPut}</div>
                  <div>Box Get: {result.storageOps.boxGet}</div>
                  <div>Box Put: {result.storageOps.boxPut}</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Opcode Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(result.opcodeCounts).map(([op, count]) => (
                    <div key={op} className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                      <span className="font-mono">{op}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
