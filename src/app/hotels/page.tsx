import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Search, MapPin, Star, Phone, Globe, BedDouble, ArrowRight } from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';

async function getHotels(search?: string) {
  return prisma.hotel.findMany({
    where: search ? {
      OR: [
        { title: { contains: search } },
        { address: { contains: search } },
      ]
    } : {},
    include: {
      destination: true,
    },
    orderBy: [{ starRating: 'desc' }, { createdAt: 'desc' }],
  });
}

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const hotels = await getHotels(searchParams.search);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero */}
      <div className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #22c55e 0%, transparent 50%), radial-gradient(circle at 80% 20%, #16a34a 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <p className="section-label text-primary-400 mb-4">Where to Stay</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Top Rated<br />
            <span className="text-primary-400">Hotels & Resorts</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-lg mb-10">
            From five-star luxury in the city to cozy mountain lodges — find the perfect stay across Pakistan.
          </p>

          {/* Search */}
          <form className="flex gap-3 max-w-lg">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                defaultValue={searchParams.search}
                placeholder="Search hotels or city..."
                className="w-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-500 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white/20"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-4 rounded-2xl font-bold text-sm shrink-0">
              Search
            </button>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-12">
            {[
              { label: 'Hotels Listed', value: `${hotels.length}+` },
              { label: 'Cities Covered', value: '10+' },
              { label: 'Star Categories', value: '3–5 ★' },
            ].map((s) => (
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
        {hotels.length === 0 ? (
          <div className="text-center py-24">
            <BedDouble size={56} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No hotels found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel: any) => {
              const gallery = hotel.gallery ? JSON.parse(hotel.gallery) : [];
              return (
                <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="group block">
                  <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm card-hover h-full flex flex-col">

                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <SafeImage
                        src={gallery[0] || DEFAULT_TOURISM_IMAGE}
                        alt={hotel.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                      {/* Stars badge */}
                      <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 text-yellow-500 shadow-sm">
                        {[...Array(hotel.starRating || 3)].map((_: any, i: number) => (
                          <Star key={i} size={11} fill="currentColor" />
                        ))}
                        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 ml-1">{hotel.starRating}-Star</span>
                      </div>

                      {/* Location */}
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                          <MapPin size={11} className="text-primary-400" />
                          {hotel.destination.title}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {hotel.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
                        {hotel.description || hotel.address}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                        <span className="text-primary-600 font-bold text-sm">{hotel.priceRange || 'Contact for price'}</span>
                        <div className="flex items-center gap-3">
                          {hotel.phone && (
                            <a href={`tel:${hotel.phone}`} onClick={(e) => e.stopPropagation()} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 hover:text-primary-600 transition-colors">
                              <Phone size={15} />
                            </a>
                          )}
                          <span className="flex items-center text-primary-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                            View <ArrowRight size={13} className="ml-1" />
                          </span>
                        </div>
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
