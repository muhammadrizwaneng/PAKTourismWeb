import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Hotel as HotelIcon, Star, Search } from 'lucide-react';
import DeleteHotelButton from './DeleteHotelButton';

const PAGE_SIZE = 20;

async function getHotels(search?: string, page: number = 1) {
  const where = search
    ? {
        OR: [
          { title: { contains: search } },
          { address: { contains: search } },
          { destination: { title: { contains: search } } },
        ],
      }
    : undefined;

  const [hotels, total] = await Promise.all([
    prisma.hotel.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { destination: { select: { title: true, province: true } } },
    }),
    prisma.hotel.count({ where }),
  ]);

  return { hotels, total };
}

export default async function HotelsAdminPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const { hotels, total } = await getHotels(searchParams.search, page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (searchParams.search) params.set('search', searchParams.search);
    params.set('page', String(p));
    return `/admin/hotels?${params.toString()}`;
  };

  return (
    <div className="space-y-8 mt-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Hotels</h1>
          <p className="text-gray-500 text-sm mt-1">Manage accommodations across Pakistan</p>
        </div>
        <Link
          href="/admin/hotels/new"
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus size={18} className="mr-2" /> Add New
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-900 overflow-hidden shadow-sm">
        {/* Search bar */}
        <form method="GET" action="/admin/hotels" className="px-8 py-4 border-b border-gray-50 dark:border-gray-900 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search}
              placeholder="Search by name, address or destination…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 text-sm font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
            Search
          </button>
          {searchParams.search && (
            <a href="/admin/hotels" className="text-xs font-bold text-gray-400 hover:text-primary-600 transition-colors">
              Clear
            </a>
          )}
          <span className="text-xs text-gray-400 ml-auto">{total} total</span>
        </form>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-900">
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Hotel</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Destination</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Rating</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Price Range</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel: any) => (
              <tr key={hotel.id} className="border-b border-gray-50 dark:border-gray-900 last:border-none hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center">
                    {hotel.gallery ? (() => {
                      try {
                        const imgs = JSON.parse(hotel.gallery);
                        return imgs[0] ? (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden mr-4 shrink-0">
                            <img src={imgs[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : null;
                      } catch { return null; }
                    })() : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4 text-gray-400 shrink-0">
                        <HotelIcon size={20} />
                      </div>
                    )}
                    <div>
                      <span className="block font-bold text-gray-900 dark:text-white">{hotel.title}</span>
                      <span className="block text-[10px] text-gray-400 font-medium mt-0.5 max-w-[200px] truncate">{hotel.address || 'No address'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{hotel.destination?.title || '—'}</span>
                    <span className="block text-[10px] text-gray-400 uppercase tracking-widest">{hotel.destination?.province || ''}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: hotel.starRating || 0 }).map((_, i) => (
                      <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">{hotel.starRating || 0}-star</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{hotel.priceRange || '—'}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/hotels/${hotel.id}`}
                      className="p-2.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <DeleteHotelButton id={hotel.id} />
                  </div>
                </td>
              </tr>
            ))}
            {hotels.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-gray-400 text-sm font-medium">
                  No hotels found. <Link href="/admin/hotels/new" className="text-primary-600 font-bold hover:underline">Add the first one.</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-4 border-t border-gray-50 dark:border-gray-900 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={buildHref(page - 1)} className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={buildHref(page + 1)} className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
