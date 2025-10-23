'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CreateToken } from '~/components/CreateToken';
import { BrowseTokens } from '~/components/BrowseTokens';
import { ClaimTokens } from '~/components/ClaimTokens';
import { TransactionHistory } from '~/components/TransactionHistory';

export default function ZamemePage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'claim' | 'history'>('browse');
  const { isConnected } = useAccount();
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b-4 border-yellow-400 py-4 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-black">
                <span className="text-yellow-400">ZAMEME</span>
                <span className="text-white">.FUN</span>
              </h1>
            </div>
            <div className="scale-90 md:scale-100">
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-yellow-400 py-2 md:py-4 overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 md:gap-2 min-w-max md:min-w-0">
            <TabButton
              active={activeTab === 'browse'}
              onClick={() => setActiveTab('browse')}
              icon="🔥"
              label="Browse"
              desc="Bonding Curves"
            />
            <TabButton
              active={activeTab === 'create'}
              onClick={() => setActiveTab('create')}
              icon="✨"
              label="Launch"
              desc="New Token"
            />
            <TabButton
              active={activeTab === 'claim'}
              onClick={() => setActiveTab('claim')}
              icon="🎁"
              label="Claim"
              desc="Your Tokens"
            />
            <TabButton
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              icon="📜"
              label="History"
              desc="Your Activity"
            />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 md:py-12">
        {!isConnected ? (
          <div className="text-center py-10 md:py-20">
            <div className="bg-yellow-400 text-black p-6 md:p-12 rounded-lg inline-block max-w-lg mx-auto">
              <div className="text-4xl md:text-6xl mb-4">🔒</div>
              <h2 className="text-2xl md:text-3xl font-black mb-4">Connect to Get Started</h2>
              <p className="mb-6 text-sm md:text-base">
                Join the confidential meme launch revolution!
                <br />
                Your contributions stay private. 
              </p>
              <div className="scale-90 md:scale-100">
                <ConnectButton />
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'browse' && <BrowseTokens />}
            {activeTab === 'create' && <CreateToken />}
            {activeTab === 'claim' && <ClaimTokens />}
            {activeTab === 'history' && <TransactionHistory />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-yellow-400 py-8 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-white text-lg">
              Powered by <span className="text-yellow-400 font-black">ZAMA</span> FHE
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Built with Universal FHEVM SDK • Zama Programs October 2025
            </p>
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <a href="https://docs.zama.ai/" className="text-yellow-400 hover:underline" target="_blank">
                Docs
              </a>
              <a href="https://discord.gg/zama" className="text-yellow-400 hover:underline" target="_blank">
                Discord
              </a>
              <a href="https://github.com/jobjab-dev/fhevm-react-template" className="text-yellow-400 hover:underline" target="_blank">
                SDK
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, desc }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-3 md:px-6 py-2 md:py-3 font-bold transition-all text-sm md:text-base ${
        active
          ? 'bg-black text-yellow-400'
          : 'bg-yellow-400 text-black hover:bg-yellow-300'
      }`}
    >
      <div className="whitespace-nowrap">
        <span className="inline md:hidden">{icon}</span>
        <span className="hidden md:inline">{icon} {label}</span>
      </div>
      <div className="text-xs opacity-75 hidden md:block">{desc}</div>
    </button>
  );
}
