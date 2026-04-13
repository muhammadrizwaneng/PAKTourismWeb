import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus, Edit2, MapPin, Map as MapIcon, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import DeleteDestinationButton from './DeleteDestinationButton';

const PAGE_SIZE = 20;

async function getDestinations(search?: string, page: number = 1) {
  const where = search ? {
    OR: [
      { title: { contains: search } },
      { city: { contains: search } },
      { province: { contains: search } },
    ],
  } : undefined;

  const [destinations, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        _count: { select: { attractions: true, packages: true, hotels: true } },
      },
    }),
    prisma.destination.count({ where }),
  ]);

  return { destinations, total };
}

export default async function DestinationsAdminPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const { destinations, total } = await getDestinations(searchParams.search, page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (searchParams.search) params.set('search', searchParams.search);
    params.set('page', String(p));
    return `/admin/destinations?${params.toString()}`;
  };

  return (
    <div className="space-y-8 mt-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Destinations</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all locations across Pakistan</p>
        </div>
        <Link
          href="/admin/destinations/new"
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus size={18} className="mr-2" /> Add New
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-900 overflow-hidden shadow-sm">

        {/* Search bar */}
        <form method="GET" action="/admin/destinations" className="px-8 py-4 border-b border-gray-50 dark:border-gray-900 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search}
              placeholder="Search by name, city or province…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 text-sm font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
            Search
          </button>
          {searchParams.search && (
            <a href="/admin/destinations" className="text-xs font-bold text-gray-400 hover:text-primary-600 transition-colors">
              Clear
            </a>
          )}
          <span className="text-xs text-gray-400 ml-auto">
            {total} total
          </span>
        </form>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-900">
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Destination</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Location</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Resources</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((dest: any) => (
              <tr key={dest.id} className="border-b border-gray-50 dark:border-gray-900 last:border-none hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center">
                    {dest.featuredImage ? (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden mr-4 shrink-0">
                        <img src={dest.featuredImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4 text-gray-400 italic text-[10px] shrink-0">No Img</div>
                    )}
                    <div>
                      <span className="block font-bold text-gray-900 dark:text-white">{dest.title}</span>
                      <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-widest">{dest.province || 'No Province'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center text-xs text-gray-500 font-medium">
                    <MapPin size={14} className="mr-2 text-primary-500 shrink-0" />
                    {dest.city || 'N/A'}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-4">
                    <Link href={`/admin/attractions?destinationId=${dest.id}`} className="text-center hover:text-primary-600 transition-colors">
                      <span className="block text-xs font-black text-gray-900 dark:text-white leading-none">{dest._count.attractions}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Spots</span>
                    </Link>
                    <span className="text-center">
                      <span className="block text-xs font-black text-gray-900 dark:text-white leading-none">{dest._count.hotels}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Hotels</span>
                    </span>
                    <span className="text-center">
                      <span className="block text-xs font-black text-gray-900 dark:text-white leading-none">{dest._count.packages}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Pkgs</span>
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/destinations/${dest.id}`}
                      className="p-2.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <DeleteDestinationButton id={dest.id} />
                  </div>
                </td>
              </tr>
            ))}
            {destinations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center">
                    <MapIcon size={48} className="text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium tracking-tight">No destinations found.</p>
                    {searchParams.search && (
                      <a href="/admin/destinations" className="mt-3 text-sm font-bold text-primary-600 hover:underline">Clear search</a>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-5 border-t border-gray-50 dark:border-gray-900 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Page <span className="font-bold text-gray-700 dark:text-gray-300">{page}</span> of <span className="font-bold text-gray-700 dark:text-gray-300">{totalPages}</span>
              {' '}· showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex items-center gap-1">
              <a
                href={page > 1 ? buildHref(page - 1) : '#'}
                aria-disabled={page <= 1}
                className={`p-2 rounded-lg transition-colors ${page <= 1 ? 'text-gray-200 dark:text-gray-700 pointer-events-none' : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-900'}`}
              >
                <ChevronLeft size={18} />
              </a>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <span key={p} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-1 text-gray-300 text-xs">…</span>
                    )}
                    <a
                      href={buildHref(p)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        p === page
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                    >
                      {p}
                    </a>
                  </span>
                ))}

              <a
                href={page < totalPages ? buildHref(page + 1) : '#'}
                aria-disabled={page >= totalPages}
                className={`p-2 rounded-lg transition-colors ${page >= totalPages ? 'text-gray-200 dark:text-gray-700 pointer-events-none' : 'text-gray-500 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-900'}`}
              >
                <ChevronRight size={18} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
