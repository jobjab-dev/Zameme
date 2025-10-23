'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useZameme } from '~/hooks/useZameme';
import { ethers } from 'ethers';

export function BuyPanel({ tokenAddress, tokenInfo }: { tokenAddress: string; tokenInfo: any }) {
  const { address } = useAccount();
  const { buyTokens, isEncrypting, isReady } = useZameme();
  const [amount, setAmount] = useState('0.05');
  const [slippage, setSlippage] = useState('auto');
  const [customSlippage, setCustomSlippage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const handleBuy = async () => {
    if (!address) {
      alert('Please connect wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsBuying(true);
    try {
      await buyTokens(tokenAddress, amount);
      alert(`✅ Purchased!\n\n💰 Deposited: ${amount} ETH\n🎁 Tokens held in Distributor\n👉 Go to "Claim" tab to withdraw`);
      
      // Save to history
      const historyItem = {
        type: 'buy',
        tokenAddress,
        tokenName: tokenInfo.name,
        tokenSymbol: tokenInfo.symbol,
        amount,
        timestamp: Date.now(),
      };
      const existing = JSON.parse(localStorage.getItem(`history_${address}`) || '[]');
      localStorage.setItem(`history_${address}`, JSON.stringify([historyItem, ...existing]));
      
    } catch (error: any) {
      console.error('Error buying:', error);
      
      // Better error messages
      let errorMsg = 'Failed to buy';
      if (error.message?.includes('Relayer')) {
        errorMsg = '⏳ Contract is being indexed by Relayer. Please wait 5-10 minutes and try again.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMsg = 'Insufficient ETH balance';
      } else if (error.message?.includes('user rejected')) {
        errorMsg = 'Transaction cancelled';
      } else {
        errorMsg = error.message || 'Failed to buy';
      }
      
      alert('Error: ' + errorMsg);
    } finally {
      setIsBuying(false);
    }
  };

  const progressPercent = Number(tokenInfo.progress);
  const currentPriceEth = ethers.formatEther(tokenInfo.currentPrice);
  const totalRaisedEth = ethers.formatEther(tokenInfo.totalRaised);
  const remaining = 0.1 - Number(totalRaisedEth);

  const getSlippageValue = () => {
    if (slippage === 'auto') return '1';
    if (slippage === 'custom') return customSlippage || '1';
    return slippage;
  };

  return (
    <div className="bg-yellow-400 text-black p-4 md:p-6 rounded-lg border-4 border-yellow-400 sticky top-6">
      {/* Header with Settings */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-black">💰 Buy Tokens</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-all flex items-center justify-center"
        >
          ⚙️
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="mb-4 bg-white border-2 border-black rounded-lg p-4">
          <h3 className="font-bold mb-3 text-sm">Slippage Tolerance</h3>
          
          <div className="grid grid-cols-3 gap-2 mb-2">
            <button
              onClick={() => setSlippage('auto')}
              className={`py-2 rounded font-bold text-xs ${
                slippage === 'auto'
                  ? 'bg-black text-yellow-400'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Auto
            </button>
            {['0.5', '1', '2'].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`py-2 rounded font-bold text-xs ${
                  slippage === s
                    ? 'bg-black text-yellow-400'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="number"
              value={customSlippage}
              onChange={(e) => {
                setCustomSlippage(e.target.value);
                setSlippage('custom');
              }}
              placeholder="Custom %"
              step="0.1"
              min="0.1"
              max="50"
              className="flex-1 p-2 border-2 border-black rounded text-sm"
            />
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 bg-black text-yellow-400 rounded font-bold text-sm"
            >
              Done
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Current: <span className="font-bold">{getSlippageValue()}%</span>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="bg-black text-yellow-400 p-4 rounded mb-4 space-y-2 text-sm">
        <Stat label="💰 Current Price" value={`${Number(currentPriceEth).toFixed(10)} ETH`} />
        <Stat label="📊 Progress" value={`${totalRaisedEth} / 0.1 ETH`} />
        <Stat label="🎯 Remaining" value={`${remaining.toFixed(4)} ETH`} />
        <Stat label="👥 Contributors" value={`${tokenInfo.contributors} 🔒`} />
        
        <div className="pt-2 border-t border-yellow-400/30">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span className="font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-yellow-400/20 rounded-full h-2">
            <div
              className="bg-yellow-400 h-full rounded-full transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Buy Form */}
      {!tokenInfo.isGraduated ? (
        <div className="space-y-3">
          <div className="bg-black/10 p-3 rounded text-xs">
            <p className="font-bold mb-1">🔒 Privacy Mode</p>
            <p>• Deposit: Visible</p>
            <p>• Balance: Hidden in Distributor</p>
            <p>• Claim: To any address</p>
          </div>

          <div>
            <label className="block font-bold mb-2 text-sm">Amount (ETH)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.05"
              step="0.01"
              min="0.001"
              className="w-full p-3 bg-white border-2 border-black rounded"
            />
          </div>

          <button
            onClick={handleBuy}
            disabled={isBuying || isEncrypting || !address || !isReady}
            className="w-full bg-black text-yellow-400 font-bold py-4 rounded hover:bg-gray-900 disabled:opacity-50 transition-all"
          >
            {!isReady ? '⏳ Loading...' : isBuying || isEncrypting ? '💰 Buying...' : `💰 Buy ${amount} ETH`}
          </button>

          <p className="text-xs text-center opacity-75">
            Tokens held in Distributor until you claim
          </p>
        </div>
      ) : (
        <div className="bg-green-600 text-white font-bold py-4 rounded text-center">
          🎉 Graduated!
          <p className="text-sm font-normal mt-1">Trading on Uniswap V2</p>
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

