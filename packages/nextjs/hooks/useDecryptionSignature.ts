'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFhevmContext } from 'jobjab-fhevm-sdk/adapters/react';
import type { DecryptionSignature } from 'jobjab-fhevm-sdk';

interface UseDecryptionSignatureOptions {
  contractAddresses: `0x${string}`[];
  signer: any;
  durationDays?: number;
  onSuccess?: (signature: DecryptionSignature) => void;
  onError?: (error: Error) => void;
}

export function useDecryptionSignature({
  contractAddresses,
  signer,
  durationDays = 365,
  onSuccess,
  onError,
}: UseDecryptionSignatureOptions) {
  const { client, isReady } = useFhevmContext();
  const [signature, setSignature] = useState<DecryptionSignature | undefined>();
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  // Check if signature is valid
  const isValid = useCallback(() => {
    if (!signature) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const expiryTime = signature.startTimestamp + (signature.durationDays * 24 * 60 * 60);
    
    return now < expiryTime;
  }, [signature]);

  // Sign function
  const sign = useCallback(async () => {
    if (!isReady || !client || !signer) {
      const err = new Error('Client or signer not available');
      setError(err);
      onError?.(err);
      return;
    }

    setIsSigning(true);
    setError(undefined);

    try {
      // Generate keypair
      const keypair = client.generateKeypair();

      // Create EIP-712 message
      const startTimestamp = Math.floor(Date.now() / 1000);
      const eip712 = client.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
        durationDays
      );

      // Sign with wallet
      const signatureString = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      // Create signature object
      const userAddress = await signer.getAddress();
      const sig: DecryptionSignature = {
        publicKey: keypair.publicKey,
        privateKey: keypair.privateKey,
        signature: signatureString.replace('0x', ''),
        startTimestamp,
        durationDays,
        userAddress: userAddress as `0x${string}`,
        contractAddresses,
      };

      setSignature(sig);
      onSuccess?.(sig);
      
      return sig;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsSigning(false);
    }
  }, [isReady, client, signer, contractAddresses, durationDays, onSuccess, onError]);

  return {
    signature,
    sign,
    isSigning,
    isValid: isValid(),
    error,
  };
}

