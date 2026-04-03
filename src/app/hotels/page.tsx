import { prisma } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Star, Phone, Globe } from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';

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
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-black">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Top Rated Hotels</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-lg">
            Find the perfect place to stay. From luxury resorts with mountain views to comfortable city stays.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="mb-12">
          <form className="max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                name="search"
                defaultValue={searchParams.search}
                placeholder="Search hotels or locations..."
                className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel: any) => {
            const gallery = hotel.gallery ? JSON.parse(hotel.gallery) : [];
            return (
              <div key={hotel.id} className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm card-hover">
                <div className="relative h-64">
                  <Image 
                    src={gallery[0] || DEFAULT_TOURISM_IMAGE} 
                    alt={hotel.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1 rounded-full flex text-yellow-500 shadow-sm">
                    {[...Array(hotel.starRating || 3)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center text-primary-600 text-xs font-bold mb-3 uppercase tracking-tight">
                    <MapPin size={12} className="mr-1" /> {hotel.destination.title}
                  </div>
                  <Link href={`/hotels/${hotel.id}`} className="block">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {hotel.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">
                    {hotel.address}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                    <div>
                      <span className="text-primary-600 font-bold text-lg">{hotel.priceRange || 'Contact for price'}</span>
                    </div>
                    <div className="flex space-x-3">
                      {hotel.phone && (
                        <a href={`tel:${hotel.phone}`} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400 hover:text-primary-600 transition-colors">
                          <Phone size={18} />
                        </a>
                      )}
                      {hotel.website && (
                        <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400 hover:text-primary-600 transition-colors">
                          <Globe size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
