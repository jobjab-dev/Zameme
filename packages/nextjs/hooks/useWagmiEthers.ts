import { useEffect, useState } from 'react';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';

export function useWagmiEthers() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();

  const [ethersReadonlyProvider, setEthersReadonlyProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setEthersReadonlyProvider(provider);

      if (walletClient) {
        provider.getSigner().then(setEthersSigner);
      }
    }
  }, [walletClient]);

  return {
    address,
    chainId,
    isConnected: !!address,
    ethersReadonlyProvider,
    ethersSigner,
  };
}

