'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

export function CreateLaunch() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    imageUrl: '',
    description: '',
    targetAmount: '1',
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      // TODO: Get contract and call createLaunch
      console.log('Creating launch:', formData);
      alert('🎉 Launch created!');
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-yellow-400 text-black p-8 rounded-lg">
        <h2 className="text-4xl font-black mb-6">✨ Create New Launch</h2>
        
        <div className="space-y-4">
          <FormInput
            label="Meme Name"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
            placeholder="e.g., Moon Doge"
          />
          
          <FormInput
            label="Symbol"
            value={formData.symbol}
            onChange={(v) => setFormData({ ...formData, symbol: v.toUpperCase() })}
            placeholder="e.g., MDOGE"
          />
          
          <FormInput
            label="Image URL"
            value={formData.imageUrl}
            onChange={(v) => setFormData({ ...formData, imageUrl: v })}
            placeholder="https://..."
          />
          
          <FormTextArea
            label="Description"
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
            placeholder="Tell the world about your meme..."
          />
          
          <FormInput
            label="Target Amount (ETH)"
            type="number"
            value={formData.targetAmount}
            onChange={(v) => setFormData({ ...formData, targetAmount: v })}
            placeholder="1.0"
            step="0.1"
          />

          <button
            onClick={handleCreate}
            disabled={isCreating || !formData.name || !formData.symbol}
            className="w-full bg-black text-yellow-400 font-black py-4 text-xl border-4 border-black hover:bg-yellow-400 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? '🚀 Launching...' : '🚀 LAUNCH THIS MEME'}
          </button>

          <p className="text-xs text-center opacity-75">
            Launch duration: 1 hour • Min contribution: 0.001 ETH
          </p>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = 'text', step }: any) {
  return (
    <div>
      <label className="block font-bold mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        className="w-full p-3 bg-white text-black border-2 border-black rounded"
      />
    </div>
  );
}

function FormTextArea({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block font-bold mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full p-3 bg-white text-black border-2 border-black rounded"
      />
    </div>
  );
}

