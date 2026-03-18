'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

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
  label = 'Upload Image'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.data.url;
      });

      const urls = await Promise.all(uploadPromises);

      if (multiple) {
        const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
        onChange([...currentValues, ...urls]);
      } else {
        onChange(urls[0]);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Failed to upload image. Check your Cloudinary credentials.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (url: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((item) => item !== url));
    } else {
      onChange('');
    }
  };

  const values = Array.isArray(value) ? value : (value ? [value] : []);

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap gap-4">
        {values.map((url) => (
          <div key={url} className="relative w-32 h-32 rounded-2xl overflow-hidden group border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:scale-[1.02]">
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
        onChange={handleUpload}
      />
      
      {values.length === 0 && !uploading && (
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">JPG, PNG or WebP. Max 5MB per image.</p>
      )}
    </div>
  );
}
