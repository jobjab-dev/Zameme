'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useZameme } from '~/hooks/useZameme';

export function CreateToken() {
  const { address } = useAccount();
  const { createToken } = useZameme();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    imageUrl: '',
    description: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!address) {
      alert('Please connect wallet');
      return;
    }

    setIsCreating(true);
    try {
      const tokenId = await createToken(formData);
      alert(`🎉 Token created! ID: ${tokenId}`);
      
      setFormData({
        name: '',
        symbol: '',
        imageUrl: '',
        description: '',
      });
    } catch (error: any) {
      console.error('Error creating token:', error);
      alert('Error: ' + (error.message || 'Failed to create token'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-yellow-400 text-black p-8 rounded-lg">
        <h2 className="text-4xl font-black mb-6">✨ Launch New Meme Token</h2>
        
        <div className="space-y-4">
          <FormInput
            label="Token Name"
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

          <div className="bg-black text-yellow-400 p-4 rounded text-sm space-y-1">
            <div>💰 Graduation Threshold: <span className="font-bold">10 ETH</span></div>
            <div>📊 Bonding Curve: <span className="font-bold">Linear (price increases with buys)</span></div>
            <div>🔒 Privacy: <span className="font-bold">Individual amounts encrypted</span></div>
          </div>

          <button
            onClick={handleCreate}
            disabled={isCreating || !formData.name || !formData.symbol || !address}
            className="w-full bg-black text-yellow-400 font-black py-4 text-xl border-4 border-black hover:bg-yellow-400 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? '🚀 Launching...' : '🚀 LAUNCH TOKEN'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = 'text' }: any) {
  return (
    <div>
      <label className="block font-bold mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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

