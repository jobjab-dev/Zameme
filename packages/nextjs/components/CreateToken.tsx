'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useZameme } from '~/hooks/useZameme';
import { ImageCropModal } from './ImageCropModal';

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
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [symbolError, setSymbolError] = useState<string>('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');

  const validateSymbol = (symbol: string): boolean => {
    if (symbol.length < 3 || symbol.length > 8) {
      setSymbolError('Symbol must be 3-8 characters');
      return false;
    }
    if (!/^[A-Z0-9]+$/.test(symbol)) {
      setSymbolError('Only A-Z and 0-9 allowed');
      return false;
    }
    setSymbolError('');
    return true;
  };

  const handleSymbolChange = (value: string) => {
    const upper = value.toUpperCase();
    setFormData({ ...formData, symbol: upper });
    if (upper) validateSymbol(upper);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be smaller than 10MB');
      return;
    }

    // Read file and show crop modal
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImageSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const uploadToIPFS = async (file: File) => {
    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      // Send token name/symbol for meaningful filename
      if (formData.symbol) {
        uploadFormData.append('tokenSymbol', formData.symbol);
      } else if (formData.name) {
        uploadFormData.append('tokenName', formData.name);
      }

      console.log('Uploading to IPFS...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setFormData((prev) => ({ ...prev, imageUrl: data.httpUrl }));
      return data.httpUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setImageFile(croppedFile);
    
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);
    
    setShowCropModal(false);
    setTempImageSrc('');

    // Auto-upload to IPFS
    try {
      await uploadToIPFS(croppedFile);
      alert(`✅ Image uploaded to IPFS! (${(croppedFile.size / 1024).toFixed(1)}KB)`);
    } catch (error: any) {
      alert('❌ Upload failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setTempImageSrc('');
  };

  const handleCreate = async () => {
    if (!address) {
      alert('Please connect wallet');
      return;
    }

    if (!validateSymbol(formData.symbol)) {
      alert('Please fix SYMBOL errors');
      return;
    }

    if (!formData.imageUrl) {
      alert('Please upload an image first');
      return;
    }

    setIsCreating(true);
    try {
      const result = await createToken(formData);
      
      const message = `🎉 Token Created!

📛 Name: ${formData.name}
💱 Symbol: ${formData.symbol}

📄 Contracts:
🏭 Token: ${result.tokenAddress}
🎁 Distributor: ${result.distributorAddress}

🔒 Privacy Features:
• Deposit amount: Visible on-chain
• Token balance: Hidden in Distributor
• Claim to any address you want!`;

      alert(message);
      
      setFormData({
        name: '',
        symbol: '',
        imageUrl: '',
        description: '',
      });
      setImageFile(null);
      setImagePreview('');
    } catch (error: any) {
      console.error('Error creating token:', error);
      alert('Error: ' + (error.message || 'Failed to create token'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {showCropModal && (
        <ImageCropModal
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-400 text-black p-4 md:p-8 rounded-lg">
          <h2 className="text-2xl md:text-4xl font-black mb-4 md:mb-6">✨ Launch New Meme Token</h2>
        
        <div className="space-y-4">
          <FormInput
            label="Token Name"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
            placeholder="e.g., Moon Doge"
          />
          
          <div>
            <label className="block font-bold mb-2">
              Symbol (3-8 chars, A-Z & 0-9 only)
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              placeholder="e.g., MDOGE"
              maxLength={8}
              className={`w-full p-3 bg-white text-black border-2 rounded ${
                symbolError ? 'border-red-500' : 'border-black'
              }`}
            />
            {symbolError && (
              <p className="text-red-600 text-sm mt-1 font-bold">⚠️ {symbolError}</p>
            )}
          </div>
          
          <div>
            <label className="block font-bold mb-2">
              Meme Image (Auto-crop to 512x512 square)
            </label>
            
            {imagePreview && (
              <div className="mb-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full aspect-square object-cover rounded border-2 border-black"
                />
                {imageFile && (
                  <p className="text-xs mt-1 text-center opacity-75">
                    ✂️ Cropped & Resized: {(imageFile.size / 1024).toFixed(1)}KB (512x512)
                  </p>
                )}
              </div>
            )}
            
            <label className="block cursor-pointer">
              <div className={`w-full p-4 bg-white text-black border-2 border-black rounded text-center font-bold ${
                isUploading ? 'opacity-50 cursor-wait' : formData.imageUrl ? 'bg-green-100' : 'hover:bg-gray-100'
              }`}>
                {isUploading ? '⏳ Uploading to IPFS...' : formData.imageUrl ? '✅ Image Ready (Click to change)' : '📁 Choose Meme Image'}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            
            <div className="mt-2 text-xs space-y-1 opacity-75">
              <p>✂️ Select image → Crop tool will open</p>
              <p>📤 Auto-upload to IPFS after crop</p>
              <p>📐 Final: 512x512 pixels (max 500KB)</p>
            </div>
            
            {formData.imageUrl && (
              <p className="text-xs mt-2 bg-black text-yellow-400 p-2 rounded break-all">
                🔗 IPFS: {formData.imageUrl}
              </p>
            )}
          </div>
          
          <FormTextArea
            label="Description"
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
            placeholder="Tell the world about your meme..."
          />

          <div className="bg-black text-yellow-400 p-3 md:p-4 rounded text-xs md:text-sm space-y-1">
            <div>💰 Threshold: <span className="font-bold">0.1 ETH</span></div>
            <div className="hidden md:block">📊 Curve: <span className="font-bold">Linear</span></div>
            <div>🔒 Privacy: <span className="font-bold">Pool + Claim</span></div>
          </div>

          <button
            onClick={handleCreate}
            disabled={isCreating || !formData.name || !formData.symbol || !formData.imageUrl || !!symbolError || !address}
            className="w-full bg-black text-yellow-400 font-black py-3 md:py-4 text-lg md:text-xl border-4 border-black hover:bg-yellow-400 hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? '🚀 Launching...' : '🚀 LAUNCH TOKEN'}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

function FormInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text' 
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
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

function FormTextArea({ 
  label, 
  value, 
  onChange, 
  placeholder 
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
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

