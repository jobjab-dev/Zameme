'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useZameme } from '~/hooks/useZameme';
import { ethers } from 'ethers';

export function ClaimTokens() {
  const { address } = useAccount();
  const { getTotalTokens, getTokenAddress, getDistributorInfo, getTokenInfo, getClaimable, claimAll, isReady } = useZameme();
  const [claimableTokens, setClaimableTokens] = useState<any[]>([]);

  useEffect(() => {
    if (!isReady || !address) return;
    
    const load = async () => {
      const total = await getTotalTokens();
      const tokens: any[] = [];
      
      for (let i = 0; i < total; i++) {
        const tokenAddr = await getTokenAddress(i);
        if (!tokenAddr) continue;
        
        const distInfo = await getDistributorInfo(tokenAddr);
        if (!distInfo) continue;
        
        const claimable = await getClaimable(distInfo.distributor, address);
        if (!claimable || claimable === 0n) continue;
        
        const info = await getTokenInfo(tokenAddr);
        if (!info) continue;
        
        tokens.push({
          ...info,
          ...distInfo,
          claimable,
        });
      }
      
      setClaimableTokens(tokens);
    };
    
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [getTotalTokens, getTokenAddress, getDistributorInfo, getTokenInfo, getClaimable, address, isReady]);

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
        <h2 className="text-2xl md:text-4xl font-black text-yellow-400 mb-2">🎁 Claim Your Tokens</h2>
        <p className="text-gray-400 text-sm md:text-base">Tokens from your deposits are held in the distributor</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {claimableTokens.map((token) => (
          <ClaimCard key={token.address} token={token} />
        ))}
        
        {claimableTokens.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-4xl md:text-6xl mb-4">💤</div>
            <p className="text-gray-400">No tokens to claim</p>
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              Deposit to pools and wait for relayer to batch purchases!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ClaimCard({ token }: { token: any }) {
  const { address } = useAccount();
  const { claimAll } = useZameme();
  const [isClaiming, setIsClaiming] = useState(false);
  const [destination, setDestination] = useState(address || '');

  const handleClaim = async () => {
    if (!destination) {
      alert('Please enter destination address');
      return;
    }

    setIsClaiming(true);
    try {
      await claimAll(token.distributor, destination);
      alert(`✅ Claimed ${ethers.formatUnits(token.claimable, 18)} ${token.symbol} to ${destination}!`);
    } catch (error: any) {
      console.error('Error claiming:', error);
      alert('Error: ' + (error.message || 'Failed to claim'));
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="bg-yellow-400 text-black p-4 md:p-6 rounded-lg border-4 border-yellow-400">
      {/* Token Image */}
      <div className="bg-black aspect-square flex items-center justify-center mb-3 md:mb-4 rounded overflow-hidden">
        {token.imageUrl ? (
          <img src={token.imageUrl} alt={token.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl md:text-8xl">🎁</div>
        )}
      </div>

      {/* Token Info */}
      <h3 className="font-black text-xl md:text-2xl mb-1">{token.name}</h3>
      <p className="text-xs md:text-sm opacity-75 mb-3 md:mb-4">${token.symbol}</p>

      {/* Claimable Amount */}
      <div className="bg-black text-yellow-400 p-3 md:p-4 rounded mb-3 md:mb-4">
        <p className="text-xs md:text-sm opacity-75">Claimable</p>
        <p className="text-xl md:text-2xl font-black">
          {parseFloat(ethers.formatUnits(token.claimable, 18)).toFixed(2)}
        </p>
        <p className="text-xs opacity-75">{token.symbol}</p>
      </div>

      {/* Claim Form */}
      <div className="space-y-2">
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destination (0x...)"
          className="w-full p-2 md:p-3 bg-white text-black border-2 border-black rounded text-xs md:text-sm"
        />
        <button
          onClick={handleClaim}
          disabled={isClaiming || !destination}
          className="w-full bg-black text-yellow-400 font-bold py-2 md:py-3 rounded hover:bg-gray-900 disabled:opacity-50 transition-all text-sm md:text-base"
        >
          {isClaiming ? '🎁 Claiming...' : '🎁 Claim All'}
        </button>
        <p className="text-xs text-center opacity-75">
          💡 Claim to any address!
        </p>
      </div>
    </div>
  );
}

