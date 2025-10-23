'use client';

import { useEffect, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { localhost, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { FhevmProvider } from 'jobjab-fhevm-sdk/adapters/react';
import '@rainbow-me/rainbowkit/styles.css';

function makeConfig() {
  return getDefaultConfig({
    appName: 'Zameme',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    chains: [sepolia, localhost],
    transports: {
      [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://eth-sepolia.public.blastapi.io'),
      [localhost.id]: http(process.env.NEXT_PUBLIC_LOCALHOST_RPC_URL || 'http://127.0.0.1:8545'),
    },
    ssr: false,
  });
}

let wagmiConfig: ReturnType<typeof makeConfig> | undefined;
let reactQueryClient: QueryClient | undefined;

function getWagmiConfig() {
  if (!wagmiConfig) {
    wagmiConfig = makeConfig();
  }
  return wagmiConfig;
}

function getQueryClient() {
  if (!reactQueryClient) {
    reactQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return reactQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={getWagmiConfig()}>
      <QueryClientProvider client={getQueryClient()}>
        <RainbowKitProvider>
          <FhevmProvider
            config={{
              network: process.env.NEXT_PUBLIC_NETWORK || 'localhost',
              provider: typeof window !== 'undefined' 
                ? (window as any).ethereum 
                : process.env.NEXT_PUBLIC_LOCALHOST_RPC_URL || 'http://127.0.0.1:8545',
              mockChains: {
                31337: 'localhost',
              },
            }}
            onStatusChange={(status) => {
              console.log('FHEVM Status:', status);
            }}
          >
            {children}
          </FhevmProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
