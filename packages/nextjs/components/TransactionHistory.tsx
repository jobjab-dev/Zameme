'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useZameme } from '~/hooks/useZameme';
import { ethers } from 'ethers';

interface HistoryItem {
  type: 'buy' | 'claim' | 'create';
  tokenAddress?: string;
  tokenName?: string;
  tokenSymbol?: string;
  amount?: string;
  timestamp: number;
  txHash?: string;
}

export function TransactionHistory() {
  const { address } = useAccount();
  const { getTotalTokens, getTokenAddress, getTokenInfo, isReady } = useZameme();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!isReady || !address) return;

    const loadHistory = async () => {
      // Load from localStorage
      const stored = localStorage.getItem(`history_${address}`);
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to load history');
        }
      }

      // Auto-discover purchases from all tokens
      const total = await getTotalTokens();
      const discovered: HistoryItem[] = [];

      for (let i = 0; i < total; i++) {
        const tokenAddr = await getTokenAddress(i);
        if (!tokenAddr) continue;

        const info = await getTokenInfo(tokenAddr);
        if (!info) continue;

        // Check if user has balance
        if (info.creator === address) {
          discovered.push({
            type: 'create',
            tokenAddress: tokenAddr,
            tokenName: info.name,
            tokenSymbol: info.symbol,
            timestamp: Date.now(),
          });
        }
      }

      // Merge with stored history
      if (discovered.length > 0) {
        const merged = [...discovered, ...history];
        const unique = merged.filter((item, index, self) =>
          index === self.findIndex((t) => 
            t.tokenAddress === item.tokenAddress && t.type === item.type
          )
        );
        setHistory(unique.sort((a, b) => b.timestamp - a.timestamp));
      }
    };

    loadHistory();
  }, [getTotalTokens, getTokenAddress, getTokenInfo, address, isReady]);

  if (!isReady) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-4xl font-black text-yellow-400 mb-2">📜 Your History</h2>
        <p className="text-gray-400 text-sm md:text-base">All your Zameme activities</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl md:text-6xl mb-4">📭</div>
            <p className="text-gray-400">No activity yet</p>
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              Buy tokens or create memes to see history
            </p>
          </div>
        ) : (
          history.map((item, i) => (
            <HistoryCard key={i} item={item} />
          ))
        )}
      </div>
    </div>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const getIcon = () => {
    switch (item.type) {
      case 'create': return '✨';
      case 'buy': return '💰';
      case 'claim': return '🎁';
      default: return '📝';
    }
  };

  const getTitle = () => {
    switch (item.type) {
      case 'create': return 'Created Token';
      case 'buy': return 'Purchased';
      case 'claim': return 'Claimed';
      default: return 'Transaction';
    }
  };

  return (
    <div className="bg-yellow-400 text-black p-4 rounded-lg border-4 border-yellow-400 flex items-start gap-4">
      <div className="text-3xl">{getIcon()}</div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-black text-lg">{getTitle()}</h3>
            {item.tokenName && (
              <p className="text-sm">
                {item.tokenName} (${item.tokenSymbol})
              </p>
            )}
          </div>
          <span className="text-xs opacity-75">
            {new Date(item.timestamp).toLocaleDateString()}
          </span>
        </div>

        {item.amount && (
          <p className="text-sm mb-2">Amount: <span className="font-bold">{item.amount} ETH</span></p>
        )}

        {item.tokenAddress && (
          <p className="text-xs opacity-75 truncate">
            Token: {item.tokenAddress}
          </p>
        )}

        {item.txHash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${item.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View on Etherscan →
          </a>
        )}
      </div>
    </div>
  );
}

