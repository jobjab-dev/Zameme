'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useFhevm } from 'jobjab-fhevm-sdk';
import { useEncrypt } from 'jobjab-fhevm-sdk/adapters/react';
import { useWagmiEthers } from './useWagmiEthers';
import { ethers } from 'ethers';

// Contract ABI (minimal for now)
const MEMELAUNCH_ABI = [
  'function createLaunch(string name, string symbol, string imageUrl, string description, uint256 targetAmount) external returns (uint256)',
  'function contribute(uint256 launchId, bytes32 encryptedAmount, bytes calldata inputProof) external payable',
  'function getMyContribution(uint256 launchId) external view returns (bytes32)',
  'function getLaunchInfo(uint256 launchId) external view returns (string, string, string, address, uint64, uint64, uint256, bool, bool, uint256)',
  'function nextLaunchId() external view returns (uint256)',
];

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Update after deploy

export function useMemeLaunch() {
  const { address } = useAccount();
  const { ethersSigner, ethersReadonlyProvider } = useWagmiEthers();
  
  // FHEVM instance
  const { instance } = useFhevm({
    provider: typeof window !== 'undefined' ? window.ethereum : undefined,
    chainId: 31337,
  });

  // Encryption hook
  const { encrypt, isEncrypting } = useEncrypt({
    contractAddress: CONTRACT_ADDRESS as `0x${string}`,
    userAddress: address as `0x${string}`,
  });

  // Get contract instance
  const getContract = useCallback((write = false) => {
    if (!write && ethersReadonlyProvider) {
      return new ethers.Contract(CONTRACT_ADDRESS, MEMELAUNCH_ABI, ethersReadonlyProvider);
    }
    if (write && ethersSigner) {
      return new ethers.Contract(CONTRACT_ADDRESS, MEMELAUNCH_ABI, ethersSigner);
    }
    return null;
  }, [ethersReadonlyProvider, ethersSigner]);

  // Create launch
  const createLaunch = useCallback(async (data: {
    name: string;
    symbol: string;
    imageUrl: string;
    description: string;
    targetAmount: string;
  }) => {
    const contract = getContract(true);
    if (!contract) throw new Error('Contract not available');

    const tx = await contract.createLaunch(
      data.name,
      data.symbol,
      data.imageUrl,
      data.description,
      ethers.parseEther(data.targetAmount)
    );

    const receipt = await tx.wait();
    return receipt;
  }, [getContract]);

  // Contribute with encryption
  const contribute = useCallback(async (launchId: number, amountEth: string) => {
    if (!encrypt) throw new Error('Encryption not available');
    
    const contract = getContract(true);
    if (!contract) throw new Error('Contract not available');

    // 1. Encrypt amount
    const amountWei = ethers.parseEther(amountEth);
    const encrypted = await encrypt({
      type: 'euint64',
      value: amountWei,
    });

    if (!encrypted) throw new Error('Encryption failed');

    // 2. Call contract
    const tx = await contract.contribute(
      launchId,
      encrypted.handles[0],
      encrypted.inputProof,
      { value: amountWei }
    );

    const receipt = await tx.wait();
    return receipt;
  }, [encrypt, getContract]);

  // Get my encrypted contribution
  const getMyContribution = useCallback(async (launchId: number) => {
    const contract = getContract(false);
    if (!contract) return null;

    const handle = await contract.getMyContribution(launchId);
    return handle;
  }, [getContract]);

  // Get launch info
  const getLaunchInfo = useCallback(async (launchId: number) => {
    const contract = getContract(false);
    if (!contract) return null;

    const info = await contract.getLaunchInfo(launchId);
    return {
      name: info[0],
      symbol: info[1],
      imageUrl: info[2],
      creator: info[3],
      targetAmount: info[4],
      totalRaised: info[5],
      endTime: info[6],
      isActive: info[7],
      isRevealed: info[8],
      contributorCount: info[9],
    };
  }, [getContract]);

  // Get total launches
  const getTotalLaunches = useCallback(async () => {
    const contract = getContract(false);
    if (!contract) return 0;

    const total = await contract.nextLaunchId();
    return Number(total);
  }, [getContract]);

  return {
    instance,
    isEncrypting,
    createLaunch,
    contribute,
    getMyContribution,
    getLaunchInfo,
    getTotalLaunches,
  };
}

