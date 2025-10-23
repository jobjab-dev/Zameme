import { NextRequest, NextResponse } from 'next/server';
import * as Client from '@storacha/client';
import { StoreMemory } from '@storacha/client/stores/memory';
import * as Proof from '@storacha/client/proof';
import { Signer } from '@storacha/client/principal/ed25519';

const KEY = process.env.W3STORAGE_PRIVATE_KEY || '';
const PROOF = process.env.W3STORAGE_PROOF || '';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    console.log('Config:', {
      hasKey: !!KEY,
      hasProof: !!PROOF,
    });
    
    if (!KEY || !PROOF) {
      return NextResponse.json(
        { error: 'Web3.Storage not configured. Need W3STORAGE_PRIVATE_KEY and W3STORAGE_PROOF' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', {
      name: file instanceof File ? file.name : 'blob',
      type: file.type,
      size: file.size,
    });

    // Initialize Storacha client
    const principal = Signer.parse(KEY);
    const store = new StoreMemory();
    const client = await Client.create({ principal, store });

    // Add proof that this agent has been delegated capabilities on the space
    const proof = await Proof.parse(PROOF);
    const space = await client.addSpace(proof);
    await client.setCurrentSpace(space.did());

    console.log('Uploading to Storacha...');
    console.log('Space DID:', space.did());
    
    // Convert to File if needed
    const uploadFile = file instanceof File 
      ? file 
      : new File([file], 'meme.jpg', { type: file.type });

    const cid = await client.uploadFile(uploadFile);
    console.log('Upload success!');
    console.log('CID:', cid.toString());

    const ipfsUrl = `ipfs://${cid}`;
    const httpUrl = `https://w3s.link/ipfs/${cid}`;

    return NextResponse.json({
      success: true,
      cid: cid.toString(),
      ipfsUrl,
      httpUrl,
    });
  } catch (error: any) {
    console.error('Upload error:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack,
      ...error,
    });
    return NextResponse.json(
      { 
        error: error.message || 'Upload failed',
        details: error.cause?.message || error.cause,
      },
      { status: 500 }
    );
  }
}

