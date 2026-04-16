'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Image as ImageIcon, Loader2,
  Eye, EyeOff, GripVertical, Video, X, Save, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  videoUrl: string | null;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  imageUrl: '',
  videoUrl: '',
  linkUrl: '',
  isActive: true,
  sortOrder: 0,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/admin/banners');
      const json = await res.json();
      setBanners(json.data ?? []);
    } catch {
      setError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openNew = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, sortOrder: banners.length });
    setError('');
    setShowForm(true);
  };

  const openEdit = (b: Banner) => {
    setEditId(b.id);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? '',
      imageUrl: b.imageUrl,
      videoUrl: b.videoUrl ?? '',
      linkUrl: b.linkUrl ?? '',
      isActive: b.isActive,
      sortOrder: b.sortOrder,
    });
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        videoUrl: form.videoUrl || undefined,
        linkUrl: form.linkUrl || undefined,
        subtitle: form.subtitle || undefined,
      };

      const url = editId ? `/api/admin/banners/${editId}` : '/api/admin/banners';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Save failed');

      closeForm();
      fetchBanners();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b: Banner) => {
    await fetch(`/api/admin/banners/${b.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !b.isActive }),
    });
    fetchBanners();
  };

  const deleteBanner = async (id: number) => {
    if (!confirm('Delete this banner?')) return;
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    fetchBanners();
  };

  return (
    <div className="space-y-8 mt-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Hero Banners</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the landing page slideshow banners (images &amp; videos)</p>
        </div>
        <button
          onClick={openNew}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus size={18} className="mr-2" /> Add Banner
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-800 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                {editId ? 'Edit Banner' : 'New Banner'}
              </h2>
              <button onClick={closeForm} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-600 text-sm font-bold rounded-2xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Discover the Mountains of Pakistan"
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. Pakistan's most breathtaking valleys await you"
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">
                    Cover Image (required — used as fallback &amp; thumbnail)
                  </label>
                  <ImageUpload
                    value={form.imageUrl}
                    onChange={(v) => setForm({ ...form, imageUrl: v as string })}
                    label="Upload Cover Image"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1 flex items-center gap-1">
                    <Video size={12} /> Video URL (optional — if set, video plays instead of image)
                  </label>
                  <input
                    type="url"
                    placeholder="https://res.cloudinary.com/…/video/…"
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Link URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://pak-tourism.vercel.app/destinations"
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    value={form.linkUrl}
                    onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 ml-1">Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Active</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 py-3 rounded-2xl font-bold text-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editId ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner List */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-primary-600" />
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-900 p-16 text-center">
          <ImageIcon size={40} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 font-bold">No banners yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-900 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-900">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Order</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Preview</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Banner</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Type</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-8 py-4">
                    <span className="inline-flex items-center gap-2 text-gray-400 text-sm font-bold">
                      <GripVertical size={14} />
                      {b.sortOrder}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="w-20 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                      {b.videoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Video size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{b.title}</p>
                    {b.subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{b.subtitle}</p>}
                  </td>
                  <td className="px-8 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${b.videoUrl ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                      {b.videoUrl ? <><Video size={11} /> Video</> : <><ImageIcon size={11} /> Image</>}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <button
                      onClick={() => toggleActive(b)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${b.isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200'}`}
                    >
                      {b.isActive ? <><Eye size={11} /> Active</> : <><EyeOff size={11} /> Hidden</>}
                    </button>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(b)}
                        className="p-2.5 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => deleteBanner(b.id)}
                        className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
