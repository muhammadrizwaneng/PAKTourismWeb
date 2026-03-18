'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

export default function NewAttractionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destinationId: '',
    entryFee: '',
    timings: '',
    gallery: [] as string[]
  });
  
  const [destinations, setDestinations] = useState<{id: number, title: string}[]>([]);

  useEffect(() => {
    fetch('/api/admin/destinations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDestinations(data.data);
          // Set initial destination if available
          if (data.data.length > 0 && !formData.destinationId) {
            setFormData(prev => ({ ...prev, destinationId: data.data[0].id.toString() }));
          }
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        destinationId: parseInt(formData.destinationId),
      };

      const res = await fetch('/api/admin/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create attraction');

      router.push('/admin/attractions');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="flex justify-between items-center">
        <div>
          <Link href="/admin/attractions" className="text-xs font-bold text-gray-400 hover:text-primary-600 flex items-center mb-4 transition-colors">
            <ArrowLeft size={14} className="mr-2" /> Back to List
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Add New Attraction</h1>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-600 text-sm font-bold rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-900 space-y-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Essential Info</h2>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Attraction Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Attabad Lake"
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Destination</label>
              <select 
                required
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                value={formData.destinationId}
                onChange={(e) => setFormData({...formData, destinationId: e.target.value})}
              >
                <option value="">Select Destination</option>
                {destinations.map(dest => (
                  <option key={dest.id} value={dest.id}>{dest.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Entry Fee</label>
                <input 
                  type="text" 
                  placeholder="Free / 500 PKR"
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm transition-all outline-none"
                  value={formData.entryFee}
                  onChange={(e) => setFormData({...formData, entryFee: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Timings</label>
                <input 
                  type="text" 
                  placeholder="8 AM - 6 PM"
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm transition-all outline-none"
                  value={formData.timings}
                  onChange={(e) => setFormData({...formData, timings: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-900 space-y-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Image Gallery</h2>
            <ImageUpload 
              multiple
              value={formData.gallery}
              onChange={(urls) => setFormData({...formData, gallery: urls as string[]})}
              label="Add Attraction Images"
            />
            <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">Help travelers visualize the attraction with high-quality photos.</p>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-900 space-y-6 shadow-sm">
             <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Description</h2>
             <textarea 
               rows={5}
               placeholder="Tell the story of this attraction..."
               className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-8 py-6 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none resize-none"
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
             />
          </div>
        </div>

        <div className="flex justify-end pt-8">
           <button 
             disabled={loading}
             className="bg-primary-600 text-white px-12 py-5 rounded-2xl font-black text-lg tracking-tight flex items-center hover:bg-primary-700 transition-all shadow-2xl shadow-primary-500/40"
           >
             {loading && <Loader2 className="animate-spin mr-3" />}
             Publish Attraction
           </button>
        </div>
      </form>
    </div>
  );
}
