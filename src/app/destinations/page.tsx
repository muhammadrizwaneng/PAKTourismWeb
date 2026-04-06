import { prisma } from '@/lib/db';
import DestinationCard from '@/components/DestinationCard';
import { Search, Filter, MapPin } from 'lucide-react';

async function getDestinations(search?: string, province?: string, taxonomyId?: string) {
  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { city: { contains: search } },
      { province: { contains: search } },
    ];
  }
  if (province) where.province = province;
  if (taxonomyId) where.taxonomyId = parseInt(taxonomyId);

  return prisma.destination.findMany({
    where,
    include: {
      taxonomy: true,
      _count: { select: { attractions: true, hotels: true, packages: true } },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  });
}

async function getTaxonomies() {
  return prisma.taxonomy.findMany({ where: { type: 'destination' } });
}

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: { search?: string; province?: string; type?: string };
}) {
  const destinations = await getDestinations(searchParams.search, searchParams.province, searchParams.type);
  const taxonomies = await getTaxonomies();
  const provinces = ['Gilgit-Baltistan', 'Punjab', 'Khyber Pakhtunkhwa', 'Sindh', 'Balochistan', 'Azad Kashmir'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 10% 50%, #22c55e 0%, transparent 50%), radial-gradient(circle at 90% 30%, #16a34a 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <p className="section-label text-primary-400 mb-4">Pakistan</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Explore<br />
            <span className="text-primary-400">Destinations</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-lg">
            From the towering Karakoram to ancient Mughal cities — discover {destinations.length}+ breathtaking places across Pakistan.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 space-y-6 shrink-0">
            <div className="glass p-6 rounded-3xl shadow-sm border-gray-100 dark:border-gray-800">
               <div className="flex items-center space-x-2 mb-5">
                 <Search size={16} className="text-primary-600" />
                 <h2 className="font-bold text-gray-900 dark:text-white text-sm">Search</h2>
               </div>
               <form className="relative">
                 <input 
                   type="text" 
                   name="search"
                   defaultValue={searchParams.search}
                   placeholder="City or Landmark..."
                   className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                 />
                 <button className="hidden" type="submit">Search</button>
               </form>
            </div>

            <div className="glass p-6 rounded-3xl shadow-sm border-gray-100 dark:border-gray-800">
               <div className="flex items-center space-x-2 mb-6">
                 <Filter size={18} className="text-primary-600" />
                 <h2 className="font-bold text-gray-900 dark:text-white">Filters</h2>
               </div>
               
               <div className="space-y-6">
                 <div>
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Province</label>
                   <div className="space-y-2">
                     {provinces.map(p => (
                       <a 
                         key={p} 
                         href={`/destinations?province=${p}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                         className={`block text-sm py-1 hover:text-primary-600 transition-colors ${searchParams.province === p ? 'text-primary-600 font-bold' : 'text-gray-600 dark:text-gray-400'}`}
                       >
                         {p}
                       </a>
                     ))}
                   </div>
                 </div>

                 <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Category</label>
                   <div className="space-y-2">
                     {taxonomies.map(t => (
                       <a 
                         key={t.id}
                         href={`/destinations?type=${t.id}${searchParams.province ? `&province=${searchParams.province}` : ''}`}
                         className={`block text-sm py-1 hover:text-primary-600 transition-colors ${searchParams.type === t.id.toString() ? 'text-primary-600 font-bold' : 'text-gray-600 dark:text-gray-400'}`}
                       >
                         {t.name}
                       </a>
                     ))}
                   </div>
                 </div>

                 <a href="/destinations" className="block text-center text-xs text-gray-400 hover:text-primary-600 mt-6 underline">
                   Clear All Filters
                 </a>
               </div>
            </div>
          </aside>

          {/* Results Grid */}
          <main className="flex-grow">
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-medium text-gray-500">
                Found <span className="text-gray-900 dark:text-white font-bold">{destinations.length}</span> destinations
              </span>
              <select className="bg-transparent text-sm font-medium border-none focus:ring-0 text-gray-700 dark:text-gray-300">
                <option>Most Recent</option>
                <option>Featured First</option>
                <option>Alphabetical</option>
              </select>
            </div>

            {destinations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {destinations.map((dest) => (
                  <DestinationCard key={dest.id} destination={dest} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-950 rounded-[2rem] p-20 text-center border border-dashed border-gray-200 dark:border-gray-800">
                 <div className="bg-gray-50 dark:bg-gray-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                   <MapPin size={32} className="text-gray-300" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No destinations found</h3>
                 <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
                 <a href="/destinations" className="mt-8 inline-block bg-primary-600 text-white px-8 py-3 rounded-full font-bold">
                   Browse All
                 </a>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
