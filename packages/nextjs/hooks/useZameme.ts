'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useFhevmContext, useEncrypt } from 'jobjab-fhevm-sdk/adapters/react';
import { useWagmiEthers } from './useWagmiEthers';
import { ethers } from 'ethers';

const ZAMEME_ABI = [
  'function createToken(string name, string symbol, string imageUrl, string description) external returns (uint256)',
  'function buy(uint256 tokenId, bytes32 encryptedAmount, bytes calldata inputProof) external payable',
  'function getTokenInfo(uint256 tokenId) external view returns (string, string, string, string, address, uint256, uint256, uint256, uint256, uint256, bool)',
  'function getMyContribution(uint256 tokenId) external view returns (bytes32)',
  'function getMyTokenBalance(uint256 tokenId) external view returns (uint256)',
  'function getCurrentPrice(uint256 tokenId) external view returns (uint256)',
  'function getProgress(uint256 tokenId) external view returns (uint256)',
  'function getRemainingToGraduate(uint256 tokenId) external view returns (uint256)',
  'function graduate(uint256 tokenId) external',
  'function nextTokenId() external view returns (uint256)',
  'function GRADUATION_THRESHOLD() external view returns (uint256)',
];

// This will be updated after deployment
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export function useZameme() {
  const { address } = useAccount();
  const { ethersSigner, ethersReadonlyProvider } = useWagmiEthers();
  const { client, isReady } = useFhevmContext();
  
  // Only initialize encrypt hook when FhevmProvider is ready
  const encryptOptions = isReady && address ? {
    contractAddress: CONTRACT_ADDRESS as `0x${string}`,
    userAddress: address as `0x${string}`,
  } : undefined;
  
  const { encrypt, isEncrypting } = useEncrypt(encryptOptions);

  const getContract = useCallback((write = false) => {
    if (!write && ethersReadonlyProvider) {
      return new ethers.Contract(CONTRACT_ADDRESS, ZAMEME_ABI, ethersReadonlyProvider);
    }
    if (write && ethersSigner) {
      return new ethers.Contract(CONTRACT_ADDRESS, ZAMEME_ABI, ethersSigner);
    }
    return null;
  }, [ethersReadonlyProvider, ethersSigner]);

  // Create new token
  const createToken = useCallback(async (data: {
    name: string;
    symbol: string;
    imageUrl: string;
    description: string;
  }) => {
    const contract = getContract(true);
    if (!contract) throw new Error('Contract not available');

    const tx = await contract.createToken(
      data.name,
      data.symbol,
      data.imageUrl,
      data.description
    );

    const receipt = await tx.wait();
    
    const event = receipt.logs
      .map((log: any) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e?.name === 'TokenCreated');
    
    return event?.args?.tokenId;
  }, [getContract]);

  // Buy tokens with encrypted receipt
  const buyTokens = useCallback(async (tokenId: number, ethAmount: string) => {
    if (!encrypt) throw new Error('Encryption not available');
    
    const contract = getContract(true);
    if (!contract) throw new Error('Contract not available');

    const amountWei = ethers.parseEther(ethAmount);
    
    const encrypted = await encrypt({
      type: 'euint64',
      value: amountWei,
    });

    if (!encrypted) throw new Error('Encryption failed');

    const tx = await contract.buy(
      tokenId,
      encrypted.handles[0],
      encrypted.inputProof,
      { value: amountWei }
    );

    const receipt = await tx.wait();
    return receipt;
  }, [encrypt, getContract]);

  // Get token info (all public data)
  const getTokenInfo = useCallback(async (tokenId: number) => {
    const contract = getContract(false);
    if (!contract) return null;

    try {
      const info = await contract.getTokenInfo(tokenId);
      return {
        name: info[0],
        symbol: info[1],
        imageUrl: info[2],
        description: info[3],
        creator: info[4],
        totalRaised: info[5],
        tokensSold: info[6],
        progress: info[7],
        currentPrice: info[8],
        contributors: info[9],
        isGraduated: info[10],
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  }, [getContract]);

  // Get my encrypted contribution (needs decrypt to view)
  const getMyContribution = useCallback(async (tokenId: number) => {
    const contract = getContract(false);
    if (!contract || !address) return null;

    try {
      const handle = await contract.getMyContribution(tokenId);
      return handle;
    } catch (error) {
      console.error('Error getting contribution:', error);
      return null;
    }
  }, [getContract, address]);

  // Get my encrypted token balance (needs decrypt to view)
  const getMyTokenBalance = useCallback(async (tokenId: number) => {
    const contract = getContract(false);
    if (!contract || !address) return null;

    try {
      const handle = await contract.getMyTokenBalance(tokenId);
      return handle;
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  }, [getContract, address]);

  // Get total number of tokens
  const getTotalTokens = useCallback(async () => {
    const contract = getContract(false);
    if (!contract) return 0;

    try {
      const total = await contract.nextTokenId();
      return Number(total);
    } catch (error) {
      console.error('Error getting total:', error);
      return 0;
    }
  }, [getContract]);

  // Graduate token (creator only)
  const graduate = useCallback(async (tokenId: number) => {
    const contract = getContract(true);
    if (!contract) throw new Error('Contract not available');

    const tx = await contract.graduate(tokenId);
    const receipt = await tx.wait();
    return receipt;
  }, [getContract]);

  return {
    client,
    isReady,
    isEncrypting,
    createToken,
    buyTokens,
    getTokenInfo,
    getMyContribution,
    getMyTokenBalance,
    getTotalTokens,
    graduate,
    contractAddress: CONTRACT_ADDRESS,
  };
}

