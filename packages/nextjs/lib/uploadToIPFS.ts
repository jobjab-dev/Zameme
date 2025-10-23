import * as Client from '@storacha/client';
import { StoreMemory } from '@storacha/client/stores/memory';
import * as Proof from '@storacha/client/proof';
import { Signer } from '@storacha/client/principal/ed25519';

const KEY = process.env.NEXT_PUBLIC_W3STORAGE_PRIVATE_KEY || '';
const PROOF = process.env.NEXT_PUBLIC_W3STORAGE_PROOF || '';

export async function uploadToIPFS(file: File): Promise<{ cid: string; ipfsUrl: string; httpUrl: string }> {
  if (!KEY || !PROOF) {
    throw new Error('Web3.Storage not configured. Need NEXT_PUBLIC_W3STORAGE_PRIVATE_KEY and NEXT_PUBLIC_W3STORAGE_PROOF');
  }

  console.log('Uploading to IPFS...');
  console.log('File:', {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  // Initialize Storacha client
  const principal = Signer.parse(KEY);
  const store = new StoreMemory();
  const client = await Client.create({ principal, store });

  // Add proof
  const proof = await Proof.parse(PROOF);
  const space = await client.addSpace(proof);
  await client.setCurrentSpace(space.did());

  console.log('Space DID:', space.did());

  // Upload
  const cid = await client.uploadFile(file);
  console.log('Upload success! CID:', cid.toString());

  const ipfsUrl = `ipfs://${cid}`;
  const httpUrl = `https://w3s.link/ipfs/${cid}`;

  return {
    cid: cid.toString(),
    ipfsUrl,
    httpUrl,
  };
}

