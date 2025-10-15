'use client';

import { useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CreateLaunch } from '~/components/CreateLaunch';
import { BrowseLaunches } from '~/components/BrowseLaunches';
import { MyContributions } from '~/components/MyContributions';

export default function ZamemePage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'my'>('browse');
  const { isConnected } = useAccount();
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b-4 border-yellow-400 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-black">
                <span className="text-yellow-400">ZAME</span>
                <span className="text-white">ME</span>
              </h1>
              <p className="text-gray-400 mt-2 text-sm">
                🔒 Confidential Fair Launch • 💰 Private Contributions • ⚖️ Fair Distribution
              </p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-yellow-400 py-4">
        <div className="container mx-auto px-4">
          <div className="flex gap-2">
            <TabButton
              active={activeTab === 'browse'}
              onClick={() => setActiveTab('browse')}
              icon="🔥"
              label="Browse"
              desc="Active Launches"
            />
            <TabButton
              active={activeTab === 'create'}
              onClick={() => setActiveTab('create')}
              icon="✨"
              label="Create"
              desc="New Launch"
            />
            <TabButton
              active={activeTab === 'my'}
              onClick={() => setActiveTab('my')}
              icon="📊"
              label="My Launches"
              desc="Private View"
            />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="bg-yellow-400 text-black p-12 rounded-lg inline-block max-w-lg">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-3xl font-black mb-4">Connect to Get Started</h2>
              <p className="mb-6">
                Join the confidential meme launch revolution!
                <br />
                Your contributions stay private. 
              </p>
              <ConnectButton />
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'browse' && <BrowseLaunches />}
            {activeTab === 'create' && <CreateLaunch />}
            {activeTab === 'my' && <MyContributions />}
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
      className={`px-6 py-3 font-bold transition-all ${
        active
          ? 'bg-black text-yellow-400'
          : 'bg-yellow-400 text-black hover:bg-yellow-300'
      }`}
    >
      <div>{icon} {label}</div>
      <div className="text-xs opacity-75">{desc}</div>
    </button>
  );
}
