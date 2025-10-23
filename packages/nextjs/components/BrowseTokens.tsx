'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useZameme } from '~/hooks/useZameme';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';

export function BrowseTokens() {
  const { getTotalTokens, getTokenAddress, isReady } = useZameme();
  const [totalTokens, setTotalTokens] = useState(0);
  const [tokenAddresses, setTokenAddresses] = useState<string[]>([]);

  useEffect(() => {
    if (!isReady) return;
    
    const load = async () => {
      const total = await getTotalTokens();
      setTotalTokens(total);
      
      // Load all token addresses
      const addresses: string[] = [];
      for (let i = 0; i < total; i++) {
        const addr = await getTokenAddress(i);
        if (addr) addresses.push(addr);
      }
      setTokenAddresses(addresses);
    };
    load();
  }, [getTotalTokens, getTokenAddress, isReady]);

  if (!isReady) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-gray-400">Loading FHE system...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-4xl font-black text-yellow-400 mb-2">Active Tokens</h2>
        <p className="text-gray-400 text-sm md:text-base">Each meme is its own ERC-20 token with encrypted contributions</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {tokenAddresses.map((addr) => (
          <TokenCard key={addr} tokenAddress={addr} />
        ))}
        
        {totalTokens === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-4xl md:text-6xl mb-4">🚀</div>
            <p className="text-gray-400">No tokens launched yet</p>
            <p className="text-xs md:text-sm text-gray-500 mt-2">Be the first to create a meme token!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TokenCard({ tokenAddress }: { tokenAddress: string }) {
  const router = useRouter();
  const { getTokenInfo } = useZameme();
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const info = await getTokenInfo(tokenAddress);
      setTokenInfo(info);
    };
    load();
    
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [tokenAddress, getTokenInfo]);

  const handleClick = () => {
    router.push(`/token/${tokenAddress}`);
  };

  if (!tokenInfo) {
    return (
      <div className="bg-yellow-400 text-black p-2 rounded-lg border-2 border-yellow-400 animate-pulse">
        <div className="bg-black aspect-square rounded mb-1"></div>
        <div className="h-3 bg-black/20 rounded mb-1"></div>
        <div className="h-2 bg-black/10 rounded"></div>
      </div>
    );
  }

  const progressPercent = Number(tokenInfo.progress);

  return (
    <div 
      onClick={handleClick}
      className="bg-yellow-400 text-black p-2 rounded-lg border-2 border-yellow-400 hover:border-yellow-300 hover:scale-105 transition-all cursor-pointer"
    >
      {/* Token Image */}
      <div className="bg-black aspect-square flex items-center justify-center mb-1.5 rounded overflow-hidden">
        {tokenInfo.imageUrl ? (
          <img src={tokenInfo.imageUrl} alt={tokenInfo.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-4xl">🚀</div>
        )}
      </div>

      {/* Token Info */}
      <h3 className="font-black text-sm mb-0.5 truncate">{tokenInfo.name}</h3>
      <p className="text-xs opacity-75 mb-1.5">${tokenInfo.symbol}</p>

      {/* Progress Bar */}
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-xs">Progress</span>
        <span className="font-bold text-xs">{progressPercent}%</span>
      </div>
      <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-black h-full transition-all duration-300"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>
      
      {tokenInfo.isGraduated && (
        <div className="mt-1.5 text-center">
          <span className="text-green-600 font-bold text-xs">✅ DONE</span>
        </div>
      )}
    </div>
  );
}

