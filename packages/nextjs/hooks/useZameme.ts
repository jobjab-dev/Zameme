'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useFhevmContext } from 'jobjab-fhevm-sdk/adapters/react';
import { useWagmiEthers } from './useWagmiEthers';
import { ethers } from 'ethers';
import deployedContracts from '~/contracts/deployedContracts';

const FACTORY_ABI = [
  'function createToken(string name, string symbol, string imageUrl, string description) external returns (address, address)',
  'function getTotalTokens() external view returns (uint256)',
  'function getTokenAddress(uint256 index) external view returns (address)',
  'function getTokenInfo(address) external view returns (address token, address distributor)',
  'function getAllTokens() external view returns (address[])',
];

const DISTRIBUTOR_ABI = [
  'function claim(uint256 amount, address destination, bytes calldata signature) external',
  'function claimAll(address destination) external',
  'function getClaimable(address user) external view returns (uint256)',
];

const MEME_TOKEN_ABI = [
  'function buy(bytes32 encryptedAmount, bytes calldata inputProof) external payable',
  'function getTokenInfo() external view returns (string, string, string, string, address, uint256, uint256, uint256, uint256, uint256, bool)',
  'function getMyContribution() external view returns (bytes32)',
  'function getMyTokenBalance() external view returns (uint256)',
  'function getCurrentPrice() external view returns (uint256)',
  'function getProgress() external view returns (uint256)',
  'function getRemainingToGraduate() external view returns (uint256)',
  'function graduate() external',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function distributor() external view returns (address)',
  'function GRADUATION_THRESHOLD() external view returns (uint256)',
];

// Auto-detect Factory address
function getFactoryAddress(): string {
  if (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
    return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  }

  try {
    const contracts = deployedContracts as any;
    if (contracts[11155111]?.MemeFactory) {
      return contracts[11155111].MemeFactory.address;
    }
    if (contracts[31337]?.MemeFactory) {
      return contracts[31337].MemeFactory.address;
    }
  } catch (e) {
    console.warn('Could not auto-detect factory address:', e);
  }

  return '0x5FbDB2315678afecb367f032d93F642f64180aa3';
}

const FACTORY_ADDRESS = getFactoryAddress();

export function useZameme() {
  const { address } = useAccount();
  const { ethersSigner, ethersReadonlyProvider } = useWagmiEthers();
  const { client, isReady } = useFhevmContext();
  const [isEncrypting, setIsEncrypting] = useState(false);

  const getFactory = useCallback((write = false) => {
    if (!write && ethersReadonlyProvider) {
      return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, ethersReadonlyProvider);
    }
    if (write && ethersSigner) {
      return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, ethersSigner);
    }
    return null;
  }, [ethersReadonlyProvider, ethersSigner]);

  const getMemeToken = useCallback((tokenAddress: string, write = false) => {
    if (!write && ethersReadonlyProvider) {
      return new ethers.Contract(tokenAddress, MEME_TOKEN_ABI, ethersReadonlyProvider);
    }
    if (write && ethersSigner) {
      return new ethers.Contract(tokenAddress, MEME_TOKEN_ABI, ethersSigner);
    }
    return null;
  }, [ethersReadonlyProvider, ethersSigner]);

  const getDistributor = useCallback((distributorAddress: string, write = false) => {
    if (!write && ethersReadonlyProvider) {
      return new ethers.Contract(distributorAddress, DISTRIBUTOR_ABI, ethersReadonlyProvider);
    }
    if (write && ethersSigner) {
      return new ethers.Contract(distributorAddress, DISTRIBUTOR_ABI, ethersSigner);
    }
    return null;
  }, [ethersReadonlyProvider, ethersSigner]);

  // Create new token (returns addresses)
  const createToken = useCallback(async (data: {
    name: string;
    symbol: string;
    imageUrl: string;
    description: string;
  }) => {
    const factory = getFactory(true);
    if (!factory) throw new Error('Factory not available');

    const tx = await factory.createToken(
      data.name,
      data.symbol,
      data.imageUrl,
      data.description
    );

    const receipt = await tx.wait();
    
    const event = receipt.logs
      .map((log: any) => {
        try {
          return factory.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e?.name === 'TokenCreated');
    
    return {
      tokenAddress: event?.args?.tokenAddress,
      distributorAddress: event?.args?.distributorAddress,
    };
  }, [getFactory]);

  // Buy tokens (deposit visible, balance hidden until claim)
  const buyTokens = useCallback(async (tokenAddress: string, ethAmount: string) => {
    if (!client || !isReady) throw new Error('FHEVM client not ready');
    if (!address) throw new Error('Wallet address not available');

    const token = getMemeToken(tokenAddress, true);
    if (!token) throw new Error('Token not available');

    const amountWei = ethers.parseEther(ethAmount);

    setIsEncrypting(true);
    try {
      const encrypted = await client.encrypt(
        tokenAddress as `0x${string}`,
        address as `0x${string}`,
        {
          type: 'euint64',
          value: amountWei,
        }
      );

      if (!encrypted) throw new Error('Encryption failed');

      const tx = await token.buy(
        encrypted.handles[0],
        encrypted.inputProof,
        { value: amountWei }
      );

      const receipt = await tx.wait();
      return receipt;
    } finally {
      setIsEncrypting(false);
    }
  }, [client, isReady, address, getMemeToken]);

  // Get token info (pass token address)
  const getTokenInfo = useCallback(async (tokenAddress: string) => {
    const token = getMemeToken(tokenAddress, false);
    if (!token) return null;

    try {
      const info = await token.getTokenInfo();
      return {
        address: tokenAddress,
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
  }, [getMemeToken]);

  // Get my encrypted contribution
  const getMyContribution = useCallback(async (tokenAddress: string) => {
    const token = getMemeToken(tokenAddress, false);
    if (!token || !address) return null;

    try {
      const handle = await token.getMyContribution();
      return handle;
    } catch (error) {
      console.error('Error getting contribution:', error);
      return null;
    }
  }, [getMemeToken, address]);

  // Get my token balance
  const getMyTokenBalance = useCallback(async (tokenAddress: string) => {
    const token = getMemeToken(tokenAddress, false);
    if (!token || !address) return null;

    try {
      const balance = await token.getMyTokenBalance();
      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  }, [getMemeToken, address]);

  // Get total number of tokens
  const getTotalTokens = useCallback(async () => {
    const factory = getFactory(false);
    if (!factory) return 0;

    try {
      const total = await factory.getTotalTokens();
      return Number(total);
    } catch (error) {
      console.error('Error getting total:', error);
      return 0;
    }
  }, [getFactory]);

  // Get token address by index
  const getTokenAddress = useCallback(async (index: number) => {
    const factory = getFactory(false);
    if (!factory) return null;

    try {
      const address = await factory.getTokenAddress(index);
      return address;
    } catch (error) {
      console.error('Error getting token address:', error);
      return null;
    }
  }, [getFactory]);

  // Graduate token
  const graduate = useCallback(async (tokenAddress: string) => {
    const token = getMemeToken(tokenAddress, true);
    if (!token) throw new Error('Token not available');

    const tx = await token.graduate();
    const receipt = await tx.wait();
    return receipt;
  }, [getMemeToken]);

  // Claim tokens to any address
  const claim = useCallback(async (distributorAddress: string, amount: string, destination: string) => {
    const distributor = getDistributor(distributorAddress, true);
    if (!distributor) throw new Error('Distributor not available');

    const amountWei = ethers.parseEther(amount);
    const tx = await distributor.claim(amountWei, destination, '0x');
    const receipt = await tx.wait();
    return receipt;
  }, [getDistributor]);

  // Claim all tokens to address
  const claimAll = useCallback(async (distributorAddress: string, destination: string) => {
    const distributor = getDistributor(distributorAddress, true);
    if (!distributor) throw new Error('Distributor not available');

    const tx = await distributor.claimAll(destination);
    const receipt = await tx.wait();
    return receipt;
  }, [getDistributor]);

  // Get claimable amount
  const getClaimable = useCallback(async (distributorAddress: string, userAddress: string) => {
    const distributor = getDistributor(distributorAddress, false);
    if (!distributor) return null;

    try {
      const amount = await distributor.getClaimable(userAddress);
      return amount;
    } catch (error) {
      console.error('Error getting claimable:', error);
      return null;
    }
  }, [getDistributor]);

  // Get distributor info
  const getDistributorInfo = useCallback(async (tokenAddress: string) => {
    const factory = getFactory(false);
    if (!factory) return null;

    try {
      const info = await factory.getTokenInfo(tokenAddress);
      return {
        token: info.token,
        distributor: info.distributor,
      };
    } catch (error) {
      console.error('Error getting distributor info:', error);
      return null;
    }
  }, [getFactory]);

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
    getTokenAddress,
    getDistributorInfo,
    claim,
    claimAll,
    getClaimable,
    graduate,
    factoryAddress: FACTORY_ADDRESS,
  };
}

