import { prisma } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Clock, Ticket } from 'lucide-react';

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
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-black">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Attractions & Landmark</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-lg">
            Find the most iconic places to visit across Pakistan. From historical forts to natural wonders.
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
                placeholder="Search attractions..."
                className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attr: any) => {
            const gallery = attr.gallery ? JSON.parse(attr.gallery) : [];
            return (
              <div key={attr.id} className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm card-hover">
                <div className="relative h-64">
                  <Image 
                    src={gallery[0] || '/placeholder.png'} 
                    alt={attr.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {attr.taxonomy && (
                    <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {attr.taxonomy.name}
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <div className="flex items-center text-primary-600 text-xs font-bold mb-3 uppercase tracking-tight">
                    <MapPin size={12} className="mr-1" /> {attr.destination.title}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 transition-colors">
                    {attr.title}
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock size={16} className="mr-2 text-primary-500" />
                      <span>{attr.timings || '9 AM - 5 PM'}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Ticket size={16} className="mr-2 text-primary-500" />
                      <span>{attr.entryFee || 'Free Entry'}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/attractions/${attr.id}`}
                    className="inline-flex items-center text-sm font-bold text-primary-600 hover:translate-x-1 transition-transform"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
