'use client';

import { useEffect, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { localhost, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { FhevmProvider } from 'jobjab-fhevm-sdk/adapters/react';
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'Zameme',
  projectId: 'YOUR_PROJECT_ID',
  chains: [sepolia, localhost],
  transports: {
    [sepolia.id]: http('https://eth-sepolia.public.blastapi.io'),
    [localhost.id]: http('http://127.0.0.1:8545'),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <FhevmProvider
            config={{
              network: 'localhost',
              provider: typeof window !== 'undefined' ? (window as any).ethereum : undefined,
              mockChains: {
                31337: 'localhost',
              },
            }}
            onStatusChange={(status) => {
              if (mounted) {
                console.log('FHEVM Status:', status);
              }
            }}
          >
            {children}
          </FhevmProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
