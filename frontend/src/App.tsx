import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './app/routes';
import { WalletProvider, WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react';

// Create WalletManager for Algorand TestNet
const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    WalletId.DEFLY
  ],
  network: NetworkId.TESTNET
});

// Create a query client for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <WalletProvider manager={walletManager}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </WalletProvider>
  );
}

export default App;
