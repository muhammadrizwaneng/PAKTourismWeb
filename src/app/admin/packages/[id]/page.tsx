'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destinationId: '',
    price: '',
    durationDays: '',
    maxPeople: '10',
    featuredImage: '',
    isFeatured: false,
    gallery: [] as string[],
    includes: [] as string[],
    excludes: [] as string[]
  });

  const [destinations, setDestinations] = useState<{id: number, title: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destRes, pkgRes] = await Promise.all([
          fetch('/api/admin/destinations'),
          fetch(`/api/admin/packages/${id}`)
        ]);

        const destData = await destRes.json();
        const pkgData = await pkgRes.json();

        if (destData.success) setDestinations(destData.data);
        if (pkgData.success) {
          const pkg = pkgData.data;
          setFormData({
            title: pkg.title,
            description: pkg.description || '',
            destinationId: pkg.destinationId.toString(),
            price: pkg.price.toString(),
            durationDays: pkg.durationDays.toString(),
            maxPeople: pkg.maxPeople.toString(),
            featuredImage: pkg.featuredImage || '',
            isFeatured: pkg.isFeatured || false,
            gallery: pkg.gallery ? JSON.parse(pkg.gallery) : [],
            includes: pkg.includes ? JSON.parse(pkg.includes) : [],
            excludes: pkg.excludes ? JSON.parse(pkg.excludes) : []
          });
        } else {
          throw new Error(pkgData.message || 'Failed to fetch package');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');

  const addInclude = () => {
    if (includeInput && !formData.includes.includes(includeInput)) {
      setFormData({...formData, includes: [...formData.includes, includeInput]});
      setIncludeInput('');
    }
  };

  const addExclude = () => {
    if (excludeInput && !formData.excludes.includes(excludeInput)) {
      setFormData({...formData, excludes: [...formData.excludes, excludeInput]});
      setExcludeInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...formData,
        destinationId: parseInt(formData.destinationId),
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        maxPeople: parseInt(formData.maxPeople),
      };

      const res = await fetch(`/api/admin/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update package');

      router.push('/admin/packages');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="flex justify-between items-center">
        <div>
          <Link href="/admin/packages" className="text-xs font-bold text-gray-400 hover:text-primary-600 flex items-center mb-4 transition-colors">
            <ArrowLeft size={14} className="mr-2" /> Back to List
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Edit Tour Package</h1>
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
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Package Details</h2>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Title</label>
              <input required type="text" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Destination</label>
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
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Price (PKR)</label>
                <input required type="number" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Duration (Days)</label>
                <input required type="number" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Max Capacity</label>
                <input required type="number" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" value={formData.maxPeople} onChange={e => setFormData({...formData, maxPeople: e.target.value})} />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/20">
              <input 
                id="isFeatured"
                type="checkbox" 
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                checked={formData.isFeatured} 
                onChange={e => setFormData({...formData, isFeatured: e.target.checked})} 
              />
              <label htmlFor="isFeatured" className="text-sm font-bold text-primary-900 dark:text-primary-100 cursor-pointer">
                Feature on Landing Page
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-900 space-y-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Images</h2>
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Featured Image</label>
               <ImageUpload value={formData.featuredImage} onChange={url => setFormData({...formData, featuredImage: url as string})} label="Featured" />
            </div>
            <div className="space-y-4 pt-2">
               <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Gallery</label>
               <ImageUpload multiple value={formData.gallery} onChange={urls => setFormData({...formData, gallery: urls as string[]})} label="Add Photos" />
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-900 grid grid-cols-1 md:grid-cols-2 gap-12 shadow-sm">
             <div className="space-y-6">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Included</h2>
                <div className="flex gap-2">
                   <input type="text" className="flex-grow bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" placeholder="e.g. Free Breakfast" value={includeInput} onChange={e => setIncludeInput(e.target.value)} />
                   <button type="button" onClick={addInclude} className="bg-gray-900 text-white p-4 rounded-xl hover:bg-black transition-colors"><Plus size={18}/></button>
                </div>
                <ul className="space-y-2">
                   {formData.includes.map(item => (
                     <li key={item} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-xl text-xs font-bold text-gray-600">
                       {item} <button type="button" onClick={() => setFormData({...formData, includes: formData.includes.filter(i => i !== item)})}><X size={14} className="text-red-500"/></button>
                     </li>
                   ))}
                </ul>
             </div>

             <div className="space-y-6">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Excluded</h2>
                <div className="flex gap-2">
                   <input type="text" className="flex-grow bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" placeholder="e.g. Flight Tickets" value={excludeInput} onChange={e => setExcludeInput(e.target.value)} />
                   <button type="button" onClick={addExclude} className="bg-gray-900 text-white p-4 rounded-xl hover:bg-black transition-colors"><Plus size={18}/></button>
                </div>
                <ul className="space-y-2">
                   {formData.excludes.map(item => (
                     <li key={item} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-xl text-xs font-bold text-gray-600">
                       {item} <button type="button" onClick={() => setFormData({...formData, excludes: formData.excludes.filter(i => i !== item)})}><X size={14} className="text-red-500"/></button>
                     </li>
                   ))}
                </ul>
             </div>
          </div>
        </div>

        <div className="flex justify-end pt-8">
           <button disabled={saving} className="bg-primary-600 text-white px-12 py-5 rounded-2xl font-black text-lg tracking-tight flex items-center hover:bg-primary-700 transition-all shadow-2xl shadow-primary-500/40">
             {saving && <Loader2 className="animate-spin mr-3" />}
             Update Tour Package
           </button>
        </div>
      </form>
    </div>
  );
}
