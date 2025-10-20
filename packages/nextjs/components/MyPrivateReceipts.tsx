'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useZameme } from '~/hooks/useZameme';
import { useDecrypt } from 'jobjab-fhevm-sdk/adapters/react';
import { useDecryptionSignature } from '~/hooks/useDecryptionSignature';
import { useWagmiEthers } from '~/hooks/useWagmiEthers';
import { ethers } from 'ethers';

export function MyPrivateReceipts() {
  const { address } = useAccount();
  const { getTotalTokens, getTokenInfo, getMyContribution, getMyTokenBalance, contractAddress, isReady } = useZameme();
  const { ethersSigner } = useWagmiEthers();
  const [totalTokens, setTotalTokens] = useState(0);
  const [expandedTokens, setExpandedTokens] = useState<Set<number>>(new Set());

  // Decryption signature hook
  const { signature, sign, isSigning, isValid } = useDecryptionSignature({
    contractAddresses: [contractAddress as `0x${string}`],
    signer: ethersSigner,
  });

  useEffect(() => {
    const load = async () => {
      const total = await getTotalTokens();
      setTotalTokens(total);
    };
    load();
  }, [getTotalTokens]);

  const toggleToken = (tokenId: number) => {
    const newExpanded = new Set(expandedTokens);
    if (newExpanded.has(tokenId)) {
      newExpanded.delete(tokenId);
    } else {
      newExpanded.add(tokenId);
    }
    setExpandedTokens(newExpanded);
  };

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
      <div className="bg-yellow-400 text-black p-6 rounded-lg mb-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🔒</div>
          <div className="flex-1">
            <h3 className="font-black text-xl">Your Private Receipts</h3>
            <p className="text-sm">Only you can decrypt and view your amounts using EIP-712 signature</p>
          </div>
          {!signature && (
            <button
              onClick={sign}
              disabled={isSigning || !address || !ethersSigner}
              className="bg-black text-yellow-400 px-6 py-3 font-bold rounded hover:bg-gray-900 disabled:opacity-50 transition-all"
            >
              {isSigning ? '⏳ Signing...' : '🔓 Sign to View'}
            </button>
          )}
          {signature && (
            <div className="bg-green-500 text-black px-4 py-2 rounded font-bold">
              ✅ Signed
            </div>
          )}
        </div>
      </div>

      {!signature ? (
        <div className="text-center py-12 text-gray-400">
          <p>Sign with your wallet to view your private receipts</p>
          <p className="text-sm mt-2">Your encrypted amounts are stored on-chain</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: totalTokens }).map((_, id) => (
            <PrivateReceiptCard
              key={id}
              tokenId={id}
              signature={signature}
              isExpanded={expandedTokens.has(id)}
              onToggle={() => toggleToken(id)}
            />
          ))}
          
          {totalTokens === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No tokens available yet</p>
              <p className="text-sm mt-2">Buy tokens to see your private receipts</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PrivateReceiptCard({
  tokenId,
  signature,
  isExpanded,
  onToggle,
}: {
  tokenId: number;
  signature: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { address } = useAccount();
  const { getTokenInfo, getMyContribution, getMyTokenBalance, contractAddress } = useZameme();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [contributionHandle, setContributionHandle] = useState<string | null>(null);
  const [balanceHandle, setBalanceHandle] = useState<string | null>(null);

  // Load token info
  useEffect(() => {
    const load = async () => {
      const info = await getTokenInfo(tokenId);
      setTokenInfo(info);
      
      if (info && address) {
        const contrib = await getMyContribution(tokenId);
        const balance = await getMyTokenBalance(tokenId);
        setContributionHandle(contrib);
        setBalanceHandle(balance);
      }
    };
    load();
  }, [tokenId, address, getTokenInfo, getMyContribution, getMyTokenBalance]);

  // Decrypt contribution
  const { decrypt: decryptContrib, isDecrypting: isDecryptingContrib, data: contribData } = useDecrypt({
    requests: contributionHandle && contributionHandle !== '0x0000000000000000000000000000000000000000000000000000000000000000'
      ? [{ handle: contributionHandle, contractAddress: contractAddress as `0x${string}` }]
      : [],
    signature: signature!,
    enabled: isExpanded && Boolean(contributionHandle && contributionHandle !== '0x0000000000000000000000000000000000000000000000000000000000000000'),
  });

  // Decrypt balance
  const { decrypt: decryptBalance, isDecrypting: isDecryptingBalance, data: balanceData } = useDecrypt({
    requests: balanceHandle && balanceHandle !== '0x0000000000000000000000000000000000000000000000000000000000000000'
      ? [{ handle: balanceHandle, contractAddress: contractAddress as `0x${string}` }]
      : [],
    signature: signature!,
    enabled: isExpanded && Boolean(balanceHandle && balanceHandle !== '0x0000000000000000000000000000000000000000000000000000000000000000'),
  });

  if (!tokenInfo) return null;
  
  const hasContributed = contributionHandle && contributionHandle !== '0x0000000000000000000000000000000000000000000000000000000000000000';
  
  if (!hasContributed) return null;

  const myContribution = contribData && contributionHandle ? contribData[contributionHandle] : null;
  const myBalance = balanceData && balanceHandle ? balanceData[balanceHandle] : null;

  return (
    <div className="bg-yellow-400 text-black p-6 rounded-lg border-2 border-yellow-500">
      <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
        <div>
          <h4 className="font-black text-xl">{tokenInfo.name} (${tokenInfo.symbol})</h4>
          <p className="text-sm opacity-75">Token ID: #{tokenId}</p>
        </div>
        <div className="text-2xl">{isExpanded ? '▼' : '▶'}</div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t-2 border-black/20 space-y-4">
          {/* My Encrypted Contribution */}
          <div className="bg-black text-yellow-400 p-4 rounded">
            <div className="text-sm font-bold mb-2">💰 My Contribution (Private)</div>
            {isDecryptingContrib ? (
              <div className="text-xs opacity-75">⏳ Decrypting...</div>
            ) : myContribution !== null ? (
              <div className="text-2xl font-black">
                {ethers.formatEther(myContribution.toString())} ETH
              </div>
            ) : (
              <div className="text-xs opacity-75">🔒 Encrypted on-chain</div>
            )}
          </div>

          {/* My Token Balance */}
          <div className="bg-black text-yellow-400 p-4 rounded">
            <div className="text-sm font-bold mb-2">🎯 My Tokens (Private)</div>
            {isDecryptingBalance ? (
              <div className="text-xs opacity-75">⏳ Decrypting...</div>
            ) : myBalance !== null ? (
              <div className="text-2xl font-black">
                {Number(ethers.formatEther(myBalance.toString())).toFixed(2)} ${tokenInfo.symbol}
              </div>
            ) : (
              <div className="text-xs opacity-75">🔒 Encrypted on-chain</div>
            )}
          </div>

          <div className="text-xs opacity-75 text-center">
            🔐 These amounts are encrypted and only visible to you
          </div>
        </div>
      )}
    </div>
  );
}

