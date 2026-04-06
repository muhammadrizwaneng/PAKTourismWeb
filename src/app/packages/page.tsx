import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Search, MapPin, Clock, Users, ArrowRight, Package } from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero */}
      <div className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-gray-900 via-teal-950 to-gray-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #0d9488 0%, transparent 50%), radial-gradient(circle at 80% 20%, #22c55e 0%, transparent 40%)' }} />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <p className="section-label text-primary-400 mb-4">Curated Trips</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Adventure<br />
            <span className="text-primary-400">Tour Packages</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-lg mb-10">
            All-inclusive itineraries crafted by expert guides. Book once, worry never.
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                defaultValue={searchParams.search}
                placeholder="Where do you want to go?"
                className="w-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-500 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="relative sm:w-48">
              <input
                type="number"
                name="maxPrice"
                defaultValue={searchParams.maxPrice}
                placeholder="Max price (PKR)"
                className="w-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-500 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-4 rounded-2xl font-bold text-sm shrink-0">
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-8 mt-12">
            {[{ label: 'Active Packages', value: `${packages.length}+` }, { label: 'Avg Duration', value: '5 Days' }, { label: 'From', value: 'PKR 8K' }].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {packages.length === 0 ? (
          <div className="text-center py-24">
            <Package size={56} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No packages found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg: any) => (
              <Link key={pkg.id} href={`/packages/${pkg.id}`} className="group block">
                <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm card-hover h-full flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    <SafeImage
                      src={pkg.featuredImage || DEFAULT_TOURISM_IMAGE}
                      alt={pkg.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {pkg.isFeatured && (
                      <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow">
                        Best Seller
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-600">
                      {pkg.durationDays} Days
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        <MapPin size={11} className="text-primary-400" />
                        {pkg.destination.title}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {pkg.title}
                    </h3>
                    <div className="flex gap-5 mb-4 flex-grow">
                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                        <Clock size={13} className="mr-1.5 text-primary-500" />
                        {pkg.durationDays}D / {pkg.durationDays - 1}N
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                        <Users size={13} className="mr-1.5 text-primary-500" />
                        Max {pkg.maxPeople || 10}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase font-bold block">Starts From</span>
                        <span className="text-xl font-black text-primary-600">PKR {pkg.price.toLocaleString()}</span>
                      </div>
                      <span className="flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-xs font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        Book <ArrowRight size={13} className="ml-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
