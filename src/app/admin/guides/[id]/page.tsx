'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

export default function EditGuidePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    address: '',
    photo: '',
    phone: '',
    email: '',
    whatsapp: '',
    languages: [] as string[],
    rating: 5,
  });

  const [langInput, setLangInput] = useState('');

  useEffect(() => {
    if (id) fetchGuide();
  }, [id]);

  const fetchGuide = async () => {
    try {
      const res = await fetch(`/api/admin/guides/${id}`);
      const data = await res.json();
      if (data.success) {
        const guide = data.data;
        setFormData({
          name: guide.name || '',
          description: guide.description || '',
          city: guide.city || '',
          address: guide.address || '',
          photo: guide.photo || '',
          phone: guide.phone || '',
          email: guide.email || '',
          whatsapp: guide.whatsapp || '',
          languages: guide.languages ? JSON.parse(guide.languages) : [],
          rating: guide.rating || 5,
        });
      }
    } catch (error) {
      console.error('Error fetching guide:', error);
      setError('Failed to fetch guide data');
    } finally {
      setFetching(false);
    }
  };

  const addLang = () => {
    if (langInput && !formData.languages.includes(langInput)) {
      setFormData({...formData, languages: [...formData.languages, langInput]});
      setLangInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/guides/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update guide');

      router.push('/admin/guides');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="flex justify-between items-center">
        <div>
          <Link href="/admin/guides" className="text-xs font-bold text-gray-400 hover:text-primary-600 flex items-center mb-4 transition-colors">
            <ArrowLeft size={14} className="mr-2" /> Back to List
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Edit Tour Guide</h1>
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
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Personal Profile</h2>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Full Name</label>
              <input required type="text" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Profile Photo</label>
               <ImageUpload value={formData.photo} onChange={url => setFormData({...formData, photo: url as string})} label="Update Photo" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">City Hub</label>
                <input required type="text" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Address/Area</label>
                <input type="text" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4 pt-4">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Languages</h2>
                <div className="flex gap-2">
                   <input type="text" className="flex-grow bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" placeholder="e.g. Urdu, English" value={langInput} onChange={e => setLangInput(e.target.value)} />
                   <button type="button" onClick={addLang} className="bg-gray-900 text-white p-4 rounded-xl hover:bg-black transition-colors"><Plus size={18}/></button>
                </div>
                <div className="flex flex-wrap gap-2">
                   {formData.languages.map(lang => (
                     <span key={lang} className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center">
                       {lang} <button type="button" onClick={() => setFormData({...formData, languages: formData.languages.filter(l => l !== lang)})} className="ml-2 text-primary-400 hover:text-primary-600"><X size={12}/></button>
                     </span>
                   ))}
                </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-900 space-y-6 shadow-sm flex flex-col">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Contact Details</h2>
            
            <div className="space-y-6 flex-grow">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Phone</label>
                  <input type="text" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Email</label>
                  <input type="email" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400">WhatsApp</label>
                  <input type="text" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                </div>
            </div>

            <div className="pt-8 mt-auto">
               <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 block mb-2">Self Description</label>
               <textarea rows={4} className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-6 py-4 text-sm outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-8">
           <button disabled={loading} className="bg-primary-600 text-white px-12 py-5 rounded-2xl font-black text-lg tracking-tight flex items-center hover:bg-primary-700 transition-all shadow-2xl shadow-primary-500/40">
             {loading && <Loader2 className="animate-spin mr-3" />}
             Update Tour Guide
           </button>
        </div>
      </form>
    </div>
  );
}
