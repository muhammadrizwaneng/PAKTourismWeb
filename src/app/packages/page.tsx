import { prisma } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Clock, Users, ArrowRight } from 'lucide-react';

async function getPackages(search?: string, maxPrice?: string) {
  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (maxPrice) {
    where.price = { lte: parseFloat(maxPrice) };
  }

  return prisma.tourPackage.findMany({
    where,
    include: {
      destination: { select: { title: true, slug: true } },
    },
    orderBy: [{ isFeatured: 'desc' }, { price: 'asc' }],
  });
}

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: { search?: string; maxPrice?: string };
}) {
  const packages = await getPackages(searchParams.search, searchParams.maxPrice);

  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-black">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Adventure Packages</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-lg">
            Curated travel experiences for Every adventurer. From budget weekend trips to luxury mountain expeditions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="glass p-8 rounded-3xl mb-12 border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-grow w-full">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Search Packages</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                name="search"
                defaultValue={searchParams.search}
                placeholder="Where do you want to go?"
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Max Price (PKR)</label>
            <input 
              type="number" 
              name="maxPrice"
              defaultValue={searchParams.maxPrice}
              placeholder="e.g. 50000"
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors w-full md:w-auto">
            Apply Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg: any) => (
            <div key={pkg.id} className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm card-hover flex flex-col h-full">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src={pkg.featuredImage || '/placeholder.png'} 
                  alt={pkg.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {pkg.isFeatured && (
                  <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    Best Seller
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary-600">
                   {pkg.durationDays} Days
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center text-gray-400 text-xs font-bold mb-3 uppercase tracking-tight">
                  <MapPin size={12} className="mr-1 text-primary-500" /> {pkg.destination.title}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 transition-colors line-clamp-1">
                  {pkg.title}
                </h3>
                <div className="flex items-center space-x-6 mb-8">
                   <div className="flex items-center text-xs text-gray-500">
                     <Clock size={14} className="mr-1.5 text-gray-400" /> {pkg.durationDays}D / {pkg.durationDays - 1}N
                   </div>
                   <div className="flex items-center text-xs text-gray-500">
                     <Users size={14} className="mr-1.5 text-gray-400" /> Max {pkg.maxPeople || 10}
                   </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800 mt-auto">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Starts From</span>
                    <span className="text-2xl font-black text-primary-600">PKR {pkg.price.toLocaleString()}</span>
                  </div>
                  <Link 
                    href={`/packages/${pkg.id}`}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-600 dark:hover:bg-primary-500 hover:text-white transition-all active:scale-95"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
