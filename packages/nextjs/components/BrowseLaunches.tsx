'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useFhevm } from 'jobjab-fhevm-sdk';
import { EncryptedInput } from 'jobjab-fhevm-sdk/components/react';
import { ethers } from 'ethers';

export function BrowseLaunches() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-black text-yellow-400 mb-2">🔥 Active Launches</h2>
        <p className="text-gray-400">Fair launches with encrypted contributions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((id) => (
          <LaunchCard key={id} launchId={id} />
        ))}
      </div>
    </div>
  );
}

function LaunchCard({ launchId }: { launchId: number }) {
  const { address } = useAccount();
  const { instance } = useFhevm({
    provider: window.ethereum,
    chainId: 31337,
  });

  return (
    <div className="bg-yellow-400 text-black p-6 rounded-lg border-4 border-yellow-400">
      {/* Meme Image */}
      <div className="bg-black aspect-square flex items-center justify-center mb-4 rounded">
        <div className="text-8xl">🚀</div>
      </div>

      {/* Info */}
      <h3 className="font-black text-2xl mb-2">MOONDOGE #{launchId}</h3>
      <p className="text-sm mb-4 opacity-75">To the moon and beyond! 🌙</p>

      {/* Stats */}
      <div className="bg-black text-yellow-400 p-4 rounded mb-4 space-y-2 text-sm">
        <Stat label="Target" value="1.0 ETH" />
        <Stat label="Contributors" value="🔒 Private" />
        <Stat label="Total Raised" value="🔒 Hidden Until End" />
        <Stat label="Time Left" value="45 min" />
      </div>

      {/* Contribute Form */}
      <ContributeForm launchId={launchId} />
    </div>
  );
}

function ContributeForm({ launchId }: { launchId: number }) {
  const { address } = useAccount();
  const [amount, setAmount] = useState('0.1');
  const [isContributing, setIsContributing] = useState(false);

  const handleContribute = async () => {
    setIsContributing(true);
    try {
      // Will integrate SDK here
      console.log(`Contributing ${amount} ETH to launch #${launchId}`);
      alert('🎉 Contribution successful! Amount is encrypted.');
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setIsContributing(false);
    }
  };

  return (
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
        onClick={handleContribute}
        disabled={isContributing}
        className="w-full bg-black text-yellow-400 font-bold py-3 rounded hover:bg-gray-900 disabled:opacity-50"
      >
        {isContributing ? '🔒 Encrypting...' : '💰 Contribute (Private)'}
      </button>
      <p className="text-xs text-center opacity-75">
        🔒 Your contribution amount stays encrypted on-chain
      </p>
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

