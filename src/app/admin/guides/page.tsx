'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Users, MapPin, Loader2, Phone, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GuidesAdminPage() {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const res = await fetch('/api/admin/guides');
      const data = await res.json();
      if (data.success) {
        setGuides(data.data);
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this guide?')) return;

    try {
      const res = await fetch(`/api/admin/guides/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGuides(guides.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error('Error deleting guide:', error);
    }
  };

  const filteredGuides = guides.filter(guide => 
    guide.name.toLowerCase().includes(search.toLowerCase()) ||
    guide.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Tour Guides</h1>
          <p className="text-gray-400 font-bold mt-2 text-sm uppercase tracking-widest">Manage your network of travel experts</p>
        </div>
        <Link 
          href="/admin/guides/new"
          className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 active:scale-95"
        >
          <Plus size={18} className="mr-2" /> Add New Guide
        </Link>
      </header>

      <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] border border-gray-100 dark:border-gray-900 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-gray-900 flex items-center gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 rounded-2xl flex-grow flex items-center border border-transparent focus-within:border-primary-500/30 transition-all">
            <Search size={18} className="text-gray-400 mr-4" />
            <input 
              type="text" 
              placeholder="Search guides by name or city..." 
              className="bg-transparent border-none outline-none text-sm w-full font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Guide</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Location</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Specialization</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary-500 mb-4" size={32} />
                    <p className="text-gray-400 font-bold text-xs uppercase">Loading experts...</p>
                  </td>
                </tr>
              ) : filteredGuides.map((guide) => (
                <tr key={guide.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-900/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 font-bold overflow-hidden">
                        {guide.photo ? (
                          <img src={guide.photo} alt={guide.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={20} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{guide.name}</div>
                        <div className="text-xs text-gray-400 font-medium flex items-center mt-1">
                          <Phone size={10} className="mr-1" /> {guide.phone || 'No phone'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 border-b border-gray-50 dark:border-gray-900">
                    <div className="flex items-center text-sm font-bold text-gray-600 dark:text-gray-300">
                      <MapPin size={14} className="mr-2 text-primary-500" />
                      {guide.city || 'N/A'}
                    </div>
                    <div className="text-[10px] text-gray-400 ml-5 mt-1">{guide.address || ''}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-gray-500 line-clamp-2 max-w-xs italic">
                      {guide.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 transition-all">
                      <Link 
                        href={`/admin/guides/${guide.id}`}
                        className="p-3 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(guide.id)}
                        className="p-3 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredGuides.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">
                    No guides found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
