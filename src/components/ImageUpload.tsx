'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Check } from 'lucide-react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

const CROP_WIDTH = 800;
const CROP_HEIGHT = 500;
const ASPECT = CROP_WIDTH / CROP_HEIGHT;

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = CROP_WIDTH;
  canvas.height = CROP_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    CROP_WIDTH,
    CROP_HEIGHT,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/jpeg', 0.92);
  });
}

interface ImageUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  multiple = false,
  label = 'Upload Image',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper state (only for featured / non-multiple)
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // For gallery (multiple) — upload directly
  const uploadBlob = async (blob: Blob, filename: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', blob, filename);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.data.url;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!multiple) {
      // Open cropper modal for single (featured) image
      const objectUrl = URL.createObjectURL(files[0]);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropSrc(objectUrl);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Gallery — upload as-is
    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map((file) => uploadBlob(file, file.name))
      );
      const currentValues = Array.isArray(value) ? value : value ? [value] : [];
      onChange([...currentValues, ...urls]);
    } catch {
      alert('Failed to upload image. Check your Cloudinary credentials.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob(cropSrc, croppedAreaPixels);
      const url = await uploadBlob(blob, 'featured.jpg');
      onChange(url);
    } catch {
      alert('Failed to upload image. Check your Cloudinary credentials.');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    }
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const removeImage = (url: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((item) => item !== url));
    } else {
      onChange('');
    }
  };

  const values = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <>
      <div className="space-y-4 w-full">
        <div className="flex flex-wrap gap-4">
          {values.map((url) => (
            <div
              key={url}
              className="relative w-32 h-32 rounded-2xl overflow-hidden group border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:scale-[1.02]"
            >
              <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 p-1.5 rounded-xl text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {(multiple || values.length === 0) && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
            >
              {uploading ? (
                <Loader2 className="animate-spin text-primary-600" size={24} />
              ) : (
                <>
                  <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-900 mb-2 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 transition-colors">
                    <Upload size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          type="file"
          multiple={multiple}
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {values.length === 0 && !uploading && (
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            {multiple ? 'JPG, PNG or WebP. Max 5MB per image.' : `JPG, PNG or WebP — will be cropped to ${CROP_WIDTH}×${CROP_HEIGHT}.`}
          </p>
        )}
      </div>

      {/* Crop Modal */}
      {cropSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-950 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-900">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                Crop Featured Image
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">
                Adjust the crop area — output will be {CROP_WIDTH}×{CROP_HEIGHT} px
              </p>
            </div>

            {/* Cropper area */}
            <div className="relative w-full" style={{ height: 360 }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom slider */}
            <div className="px-6 pt-4 pb-2 flex items-center gap-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-10">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-primary-600"
              />
            </div>

            {/* Actions */}
            <div className="p-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCropCancel}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={handleCropConfirm}
                className="px-6 py-2.5 rounded-2xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {uploading ? 'Uploading…' : 'Crop & Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
