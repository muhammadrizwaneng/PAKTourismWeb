'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Palmtree, MapPin, Loader2, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function AttractionsList() {
  const [attractions, setAttractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const searchParams = useSearchParams();
  const destinationId = searchParams.get('destinationId');

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      const res = await fetch('/api/admin/attractions');
      const data = await res.json();
      if (data.success) {
        setAttractions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch attractions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this attraction?')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/attractions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAttractions(attractions.filter(a => a.id !== id));
      } else {
        alert('Failed to delete attraction');
      }
    } catch (error) {
      alert('An error occurred while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  // Apply both destination filter and search filter
  const filteredAttractions = attractions.filter(attr => {
    const matchesSearch = attr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attr.destination?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDestination = !destinationId || attr.destinationId === parseInt(destinationId);
    
    return matchesSearch && matchesDestination;
  });

  const activeDestination = destinationId ? attractions.find(a => a.destinationId === parseInt(destinationId))?.destination?.title : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Attractions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeDestination ? `Showing attractions for ${activeDestination}` : 'Manage points of interest and landmarks'}
          </p>
          {destinationId && (
            <Link 
              href="/admin/attractions"
              className="mt-2 text-[10px] font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-2 py-1 rounded-lg flex items-center w-fit hover:bg-primary-100 transition-colors"
            >
              <X size={10} className="mr-1" /> Clear Destination Filter
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search attractions..."
              className="w-full bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link
            href="/admin/attractions/new"
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 whitespace-nowrap"
          >
            <Plus size={18} className="mr-2" /> Add New
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-900 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="font-medium">Loading attractions...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-900">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Attraction</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Destination</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Type</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttractions.map((attr: any) => (
                <tr key={attr.id} className="border-b border-gray-50 dark:border-gray-900 last:border-none hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <Link href={`/attractions/${attr.id}`} target="_blank" className="flex items-center hover:opacity-80 transition-opacity group/link">
                        {attr.gallery && JSON.parse(attr.gallery)[0] ? (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden mr-4 shadow-inner">
                            <img src={JSON.parse(attr.gallery)[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4 text-gray-400 italic text-[8px] uppercase font-black">No Image</div>
                        )}
                        <div>
                          <span className="block font-bold text-gray-900 dark:text-white leading-tight group-hover/link:text-primary-600 transition-colors">{attr.title}</span>
                          <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1 opacity-60">{attr.slug}</span>
                        </div>
                      </Link>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center text-xs text-gray-500 font-bold">
                      <MapPin size={14} className="mr-2 text-primary-500" />
                      {attr.destination?.title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-wider">
                      {attr.taxonomy?.name || 'General'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 transition-opacity">
                      <Link 
                        href={`/admin/attractions/${attr.id}`}
                        className="p-2.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button 
                        disabled={deletingId === attr.id}
                        onClick={() => handleDelete(attr.id)}
                        className="p-2.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all disabled:opacity-50"
                      >
                        {deletingId === attr.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAttractions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <Palmtree size={48} className="text-gray-100 mb-4" />
                      <p className="font-bold tracking-tight">No attractions found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function AttractionsAdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-primary-600" size={32} /></div>}>
      <AttractionsList />
    </Suspense>
  );
}
