import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Search, MapPin, Clock, Ticket, ArrowRight, Compass } from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';

async function getAttractions(search?: string) {
  return prisma.attraction.findMany({
    where: search ? {
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    } : {},
    include: {
      destination: true,
      taxonomy: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AttractionsPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const attractions = await getAttractions(searchParams.search);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero */}
      <div className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 60%, #16a34a 0%, transparent 50%), radial-gradient(circle at 20% 30%, #22c55e 0%, transparent 40%)' }} />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <p className="section-label text-primary-400 mb-4">Discover</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Iconic Attractions<br />
            <span className="text-primary-400">&amp; Landmarks</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-lg mb-10">
            Pakistan's most spectacular sights — from ancient forts to soaring peaks and sacred shrines.
          </p>

          <form className="flex gap-3 max-w-lg">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                defaultValue={searchParams.search}
                placeholder="Search attractions..."
                className="w-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-500 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-4 rounded-2xl font-bold text-sm shrink-0">
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-8 mt-12">
            {[{ label: 'Attractions', value: `${attractions.length}+` }, { label: 'Provinces Covered', value: '7' }, { label: 'Categories', value: '8+' }].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {attractions.length === 0 ? (
          <div className="text-center py-24">
            <Compass size={56} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No attractions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {attractions.map((attr: any) => {
              const gallery = attr.gallery ? JSON.parse(attr.gallery) : [];
              return (
                <Link key={attr.id} href={`/attractions/${attr.id}`} className="group block">
                  <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm card-hover h-full flex flex-col">
                    <div className="relative h-56 overflow-hidden">
                      <SafeImage
                        src={gallery[0] || DEFAULT_TOURISM_IMAGE}
                        alt={attr.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {attr.taxonomy && (
                        <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow">
                          {attr.taxonomy.name}
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                          <MapPin size={11} className="text-primary-400" />
                          {attr.destination.title}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors">
                        {attr.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 mb-4 flex-grow">
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                          <Clock size={13} className="mr-1.5 text-primary-500" />
                          {attr.timings || '9 AM – 5 PM'}
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                          <Ticket size={13} className="mr-1.5 text-primary-500" />
                          {attr.entryFee || 'Free Entry'}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-auto">
                        <span className="text-xs text-gray-400">Tap to explore</span>
                        <span className="flex items-center text-primary-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                          Details <ArrowRight size={13} className="ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
