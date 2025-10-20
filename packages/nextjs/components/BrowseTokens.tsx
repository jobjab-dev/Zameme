'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useZameme } from '~/hooks/useZameme';
import { ethers } from 'ethers';

export function BrowseTokens() {
  const { getTotalTokens, isReady } = useZameme();
  const [totalTokens, setTotalTokens] = useState(0);

  useEffect(() => {
    if (!isReady) return;
    
    const load = async () => {
      const total = await getTotalTokens();
      setTotalTokens(total);
    };
    load();
  }, [getTotalTokens, isReady]);

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
      <div className="mb-8">
        <h2 className="text-4xl font-black text-yellow-400 mb-2">🔥 Active Tokens</h2>
        <p className="text-gray-400">Bonding curve fair launches with encrypted contributions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: totalTokens }).map((_, id) => (
          <TokenCard key={id} tokenId={id} />
        ))}
        
        {totalTokens === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-gray-400">No tokens launched yet</p>
            <p className="text-sm text-gray-500 mt-2">Be the first to create a meme token!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TokenCard({ tokenId }: { tokenId: number }) {
  const { address } = useAccount();
  const { getTokenInfo, buyTokens, isEncrypting, isReady } = useZameme();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [amount, setAmount] = useState('0.1');
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    const load = async () => {
      const info = await getTokenInfo(tokenId);
      setTokenInfo(info);
    };
    load();
    
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [tokenId, getTokenInfo]);

  const handleBuy = async () => {
    if (!address) {
      alert('Please connect wallet');
      return;
    }

    setIsBuying(true);
    try {
      await buyTokens(tokenId, amount);
      alert('🎉 Purchase successful! Your amount is encrypted on-chain.');
      
      const info = await getTokenInfo(tokenId);
      setTokenInfo(info);
    } catch (error: any) {
      console.error('Error buying:', error);
      alert('Error: ' + (error.message || 'Failed to buy'));
    } finally {
      setIsBuying(false);
    }
  };

  if (!tokenInfo) {
    return (
      <div className="bg-yellow-400 text-black p-6 rounded-lg border-4 border-yellow-400 animate-pulse">
        <div className="bg-black aspect-square rounded mb-4"></div>
        <div className="h-6 bg-black/20 rounded mb-2"></div>
        <div className="h-4 bg-black/10 rounded"></div>
      </div>
    );
  }

  const progressPercent = Number(tokenInfo.progress);
  const currentPriceEth = ethers.formatEther(tokenInfo.currentPrice);
  const totalRaisedEth = ethers.formatEther(tokenInfo.totalRaised);
  const remaining = 10 - Number(totalRaisedEth);

  return (
    <div className="bg-yellow-400 text-black p-6 rounded-lg border-4 border-yellow-400 hover:border-yellow-300 transition-all">
      {/* Token Image */}
      <div className="bg-black aspect-square flex items-center justify-center mb-4 rounded overflow-hidden">
        {tokenInfo.imageUrl ? (
          <img src={tokenInfo.imageUrl} alt={tokenInfo.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-8xl">🚀</div>
        )}
      </div>

      {/* Token Info */}
      <h3 className="font-black text-2xl mb-1">{tokenInfo.name}</h3>
      <p className="text-sm opacity-75 mb-1">${tokenInfo.symbol}</p>
      <p className="text-xs mb-4 line-clamp-2">{tokenInfo.description}</p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Progress</span>
          <span className="font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-black h-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Public Stats (No individual amounts shown!) */}
      <div className="bg-black text-yellow-400 p-4 rounded mb-4 space-y-2 text-sm">
        <Stat label="💰 Current Price" value={`${Number(currentPriceEth).toFixed(10)} ETH`} />
        <Stat label="📊 Progress" value={`${totalRaisedEth} / 10 ETH`} />
        <Stat label="🎯 Remaining" value={`${remaining.toFixed(2)} ETH`} />
        <Stat label="👥 Contributors" value={`${tokenInfo.contributors} 🔒`} />
        {tokenInfo.isGraduated && (
          <div className="pt-2 border-t border-yellow-400/30">
            <span className="text-green-400 font-bold">✅ GRADUATED!</span>
          </div>
        )}
      </div>

      {/* Buy Form */}
      {!tokenInfo.isGraduated ? (
        <div className="space-y-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (ETH)"
            step="0.01"
            min="0.001"
            className="w-full p-3 bg-white text-black border-2 border-black rounded"
          />
          <button
            onClick={handleBuy}
            disabled={isBuying || isEncrypting || !address || !isReady}
            className="w-full bg-black text-yellow-400 font-bold py-3 rounded hover:bg-gray-900 disabled:opacity-50 transition-all"
          >
            {!isReady ? '⏳ Loading FHE...' : isBuying || isEncrypting ? '🔒 Encrypting & Buying...' : '💰 Buy (Amount Private)'}
          </button>
          <p className="text-xs text-center opacity-75">
            🔒 Your purchase amount is encrypted on-chain
          </p>
        </div>
      ) : (
        <div className="bg-green-500 text-black font-bold py-3 rounded text-center">
          🎉 Graduated - Trading on DEX
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="opacity-75">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

