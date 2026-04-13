'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

export default function EditDestinationPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    province: '',
    bestTime: '',
    latitude: '',
    longitude: '',
    featuredImage: '',
    isFeatured: false,
    galleryImages: [] as string[],
  });

  useEffect(() => {
    fetch(`/api/admin/destinations/${id}`)
      .then((r) => r.json())
      .then((json) => {
        const d = json.data;
        setFormData({
          title: d.title ?? '',
          description: d.description ?? '',
          city: d.city ?? '',
          province: d.province ?? '',
          bestTime: d.bestTime ?? '',
          latitude: d.latitude != null ? String(d.latitude) : '',
          longitude: d.longitude != null ? String(d.longitude) : '',
          featuredImage: d.featuredImage ?? '',
          isFeatured: d.isFeatured ?? false,
          galleryImages: d.galleryImages ? JSON.parse(d.galleryImages) : [],
        });
      })
      .catch(() => setError('Failed to load destination'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      const res = await fetch(`/api/admin/destinations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update destination');

      router.push('/admin/destinations');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="flex justify-between items-center">
        <div>
          <Link href="/admin/destinations" className="text-xs font-bold text-gray-400 hover:text-primary-600 flex items-center mb-4 transition-colors">
            <ArrowLeft size={14} className="mr-2" /> Back to List
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Edit Destination</h1>
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
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Basic Information</h2>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Destination Title</label>
              <input
                required
                type="text"
                placeholder="e.g. Swat Valley"
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">City</label>
              <input
                type="text"
                placeholder="e.g. Mingora"
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Province</label>
                <input
                  type="text"
                  placeholder="KPK"
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Best Time</label>
                <input
                  type="text"
                  placeholder="May - Oct"
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                  value={formData.bestTime}
                  onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="34.0151"
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="72.0037"
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
              <input
                type="checkbox"
                id="isFeatured"
                className="w-5 h-5 rounded-lg text-primary-600 border-none focus:ring-0 mr-4"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              <label htmlFor="isFeatured" className="text-xs font-bold text-gray-600 dark:text-gray-300">
                Feature this destination on Home Page
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-900 space-y-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Media & Visuals</h2>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Featured Image</label>
              <ImageUpload
                value={formData.featuredImage}
                onChange={(url) => setFormData({ ...formData, featuredImage: url as string })}
                label="Featured"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Image Gallery</label>
              <ImageUpload
                multiple
                value={formData.galleryImages}
                onChange={(urls) => setFormData({ ...formData, galleryImages: urls as string[] })}
                label="Add to Gallery"
              />
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-900 space-y-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-50 dark:border-gray-900 pb-4">Detailed Description</h2>
            <textarea
              rows={6}
              placeholder="Describe the beauty and significance of this destination..."
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-8 py-6 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none resize-none leading-relaxed"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end pt-8">
          <button
            disabled={loading}
            className="bg-primary-600 text-white px-12 py-5 rounded-2xl font-black text-lg tracking-tight flex items-center hover:bg-primary-700 transition-all disabled:opacity-50 shadow-2xl shadow-primary-500/40"
          >
            {loading ? <Loader2 className="animate-spin mr-3" /> : <Save className="mr-3" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
