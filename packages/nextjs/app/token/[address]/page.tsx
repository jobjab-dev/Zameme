'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useZameme } from '~/hooks/useZameme';
import { PriceChart } from '~/components/PriceChart';
import { BuyPanel } from '~/components/BuyPanel';
import { TokenChat } from '~/components/TokenChat';

export default function TokenDetailPage({ params }: { params: { address: string } }) {
  const { address } = params;
  const router = useRouter();
  const { getTokenInfo, isReady } = useZameme();
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    if (!isReady) return;

    const load = async () => {
      const info = await getTokenInfo(address);
      setTokenInfo(info);
    };
    load();

    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [address, getTokenInfo, isReady]);

  if (!isReady || !tokenInfo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-400">Loading token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b-4 border-yellow-400 py-4 md:py-6">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="text-yellow-400 hover:text-yellow-300 mb-4 text-sm"
          >
            ← Back
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-lg overflow-hidden border-2 border-yellow-400">
              {tokenInfo.imageUrl ? (
                <img src={tokenInfo.imageUrl} alt={tokenInfo.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🚀</div>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-yellow-400">{tokenInfo.name}</h1>
              <p className="text-gray-400">${tokenInfo.symbol}</p>
              <p className="text-xs text-gray-500">by {tokenInfo.creator?.slice(0, 6)}...{tokenInfo.creator?.slice(-4)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart */}
          <div className="lg:col-span-2 space-y-6">
            <PriceChart tokenAddress={address} />
            <TokenChat tokenAddress={address} />
          </div>

          {/* Right: Buy Panel */}
          <div className="lg:col-span-1">
            <BuyPanel tokenAddress={address} tokenInfo={tokenInfo} />
          </div>
        </div>
      </div>
    </div>
  );
}

