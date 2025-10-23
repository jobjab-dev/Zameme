'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';

interface ImageCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

export function ImageCropModal({ imageSrc, onCropComplete, onCancel }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaChange = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      const size = 512;
      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        size,
        size
      );

      return new Promise<File>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }

            if (blob.size > 500 * 1024) {
              reject(new Error('Image too large after crop. Try zooming in more.'));
              return;
            }

            const file = new File([blob], 'meme.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(file);
          },
          'image/jpeg',
          0.85
        );
      });
    } catch (error) {
      console.error('Crop error:', error);
      throw error;
    }
  }, [imageSrc, croppedAreaPixels]);

  const handleDone = async () => {
    try {
      const croppedFile = await createCroppedImage();
      if (croppedFile) {
        onCropComplete(croppedFile);
      }
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Failed to crop image'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-yellow-400 rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 text-black">✂️ Crop Your Meme</h3>
        
        <div className="relative bg-black rounded overflow-hidden" style={{ height: '300px', maxHeight: '50vh' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaChange}
          />
        </div>

        <div className="mt-3 md:mt-4 space-y-2 md:space-y-3">
          <div>
            <label className="block font-bold mb-2 text-black text-xs md:text-sm">
              🔍 Zoom: {zoom.toFixed(1)}x
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="text-xs text-black opacity-75 space-y-1">
            <p>💡 Drag to move • Slider to zoom</p>
            <p className="hidden md:block">💡 Final: 512x512 pixels (max 500KB)</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 bg-white text-black font-bold py-2 md:py-3 rounded border-2 border-black hover:bg-gray-100 text-sm md:text-base"
            >
              ❌ Cancel
            </button>
            <button
              onClick={handleDone}
              className="flex-1 bg-black text-yellow-400 font-bold py-2 md:py-3 rounded border-2 border-black hover:bg-gray-900 text-sm md:text-base"
            >
              ✅ Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}

