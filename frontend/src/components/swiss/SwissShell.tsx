import React from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { SwissButton } from './SwissButton';

interface SwissShellProps {
  children: React.ReactNode;
}

export function SwissShell({ children }: SwissShellProps) {
  const { activeAddress, wallets } = useWallet();

  return (
    <div className="min-h-screen bg-white text-black font-sans swiss-noise p-4 md:p-8">
      {/* Outer strict border frame */}
      <div className="max-w-[1600px] mx-auto border-4 border-black min-h-[calc(100vh-4rem)] flex flex-col bg-white relative z-20">
        
        {/* Brutalist Top Navigation */}
        <header className="border-b-4 border-black p-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-8">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase m-0 leading-none">
              AlgoForge <span className="text-swiss-red">AI</span>
            </h1>
            
            {/* Inert Navigation */}
            <nav className="hidden md:flex gap-6 text-sm font-bold tracking-widest uppercase">
              <span className="text-black cursor-pointer hover:text-swiss-red">01. Analysis</span>
              <span className="text-gray-400 cursor-not-allowed">02. Reports</span>
              <span className="text-gray-400 cursor-not-allowed">03. System</span>
            </nav>
          </div>

          {/* Wallet Status */}
          <div className="flex items-center gap-4">
            {activeAddress ? (
              <div className="flex items-center gap-2 border-2 border-black px-4 py-2 font-bold text-sm uppercase">
                <span className="w-2 h-2 bg-green-500 block" />
                {activeAddress.slice(0, 8)}...{activeAddress.slice(-4)}
              </div>
            ) : (
              <div className="flex gap-2">
                {wallets?.map((wallet) => (
                  <SwissButton 
                    key={wallet.id} 
                    onClick={wallet.connect}
                    variant="secondary"
                    className="py-2 px-4"
                  >
                    Connect {wallet.metadata.name}
                  </SwissButton>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
