import { prisma } from '@/lib/db';
import DestinationCard from '@/components/DestinationCard';
import { Search, Filter, MapPin, ArrowRight } from 'lucide-react';

const PAGE_SIZE = 12;

async function getDestinations(search?: string, province?: string, taxonomyId?: string, page: number = 1) {
  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { city: { contains: search } },
      { province: { contains: search } },
      { taxonomy: { name: { contains: search } } },
    ];
  }
  if (province) where.province = province;
  if (taxonomyId) where.taxonomyId = parseInt(taxonomyId);

  const [destinations, totalCount] = await Promise.all([
    prisma.destination.findMany({
      where,
      select: {
        id: true,
        title: true,
        featuredImage: true,
        isFeatured: true,
        city: true,
        province: true,
        description: true,
        taxonomy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            attractions: true,
            hotels: true,
            packages: true,
          },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.destination.count({ where }),
  ]);

  return { destinations, totalCount };
}

async function getTaxonomies() {
  return prisma.taxonomy.findMany({ where: { type: 'destination' } });
}

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: { search?: string; province?: string; type?: string; page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const { destinations, totalCount } = await getDestinations(
    searchParams.search,
    searchParams.province,
    searchParams.type,
    page
  );
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const taxonomies = await getTaxonomies();
  const provinces = ['Gilgit-Baltistan', 'Punjab', 'Khyber Pakhtunkhwa', 'Sindh', 'Balochistan', 'Azad Kashmir'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 10% 50%, #22c55e 0%, transparent 50%), radial-gradient(circle at 90% 30%, #16a34a 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <p className="section-label text-primary-400 mb-4">Pakistan</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Explore<br />
            <span className="text-primary-400">Destinations</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg leading-relaxed mb-4">
            Pakistan is one of the world's most geographically diverse countries — a land where you can stand on the roof of the world in Gilgit-Baltistan, wander through 5,000-year-old civilisations in Sindh, explore Mughal heritage in Punjab, surf the Arabian Sea in Karachi, and trek through pine-covered mountains in Khyber Pakhtunkhwa, all within a single journey.
          </p>
          <p className="text-gray-500 max-w-3xl text-base leading-relaxed mb-4">
            From the salt mines of Khewra to the high-altitude plains of Deosai, the diversity of our landscape is matched only by the richness of our hospitality. Our platform aims to bridge the gap between travelers and the authentic Pakistan, providing verified guides, real-time weather updates, and comprehensive location insights to ensure every journey is safe, memorable, and adventurous.
          </p>
          <p className="text-gray-500 max-w-2xl text-base leading-relaxed">
            Browse {totalCount}+ verified destinations across all provinces of Pakistan. We continuously update our database with new attractions, historical sites, and eco-tourism spots to provide the most current travel resource for both domestic and international tourists.
          </p>

          <form method="GET" action="/destinations" className="mt-8 max-w-2xl">
            <div className="flex gap-3">
              <div className="relative flex-grow">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.search}
                  placeholder="Search destinations, cities, provinces..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 text-base"
                />
                {searchParams.province && <input type="hidden" name="province" value={searchParams.province} />}
                {searchParams.type && <input type="hidden" name="type" value={searchParams.type} />}
              </div>
              <button
                type="submit"
                className="shrink-0 bg-primary-500 hover:bg-primary-400 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary-500/30"
              >
                <Search size={18} /> Search
              </button>
            </div>
            {searchParams.search && (
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-gray-400">Results for <span className="text-primary-400 font-semibold">"{searchParams.search}"</span></span>
                <a href="/destinations" className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest underline">Clear</a>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 space-y-6 shrink-0">
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
                        href={`/destinations?province=${encodeURIComponent(p)}${searchParams.search ? `&search=${encodeURIComponent(searchParams.search)}` : ''}${searchParams.type ? `&type=${searchParams.type}` : ''}`}
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
                    {taxonomies.map((t: (typeof taxonomies)[number]) => (
                      <a
                        key={t.id}
                        href={`/destinations?type=${t.id}${searchParams.province ? `&province=${encodeURIComponent(searchParams.province)}` : ''}${searchParams.search ? `&search=${encodeURIComponent(searchParams.search)}` : ''}`}
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
                Found <span className="text-gray-900 dark:text-white font-bold">{totalCount}</span> destination{totalCount !== 1 ? 's' : ''}
                {(searchParams.search || searchParams.province || searchParams.type) && (
                  <a href="/destinations" className="ml-3 text-xs text-primary-600 hover:underline font-bold">Clear filters</a>
                )}
              </span>
              <select className="bg-transparent text-sm font-medium border-none focus:ring-0 text-gray-700 dark:text-gray-300">
                <option>Most Recent</option>
                <option>Featured First</option>
                <option>Alphabetical</option>
              </select>
            </div>

            {destinations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {destinations.map((dest: (typeof destinations)[number]) => (
                    <DestinationCard key={dest.id} destination={dest} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    {page > 1 && (
                      <a
                        href={`/destinations?page=${page - 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.province ? `&province=${searchParams.province}` : ''}${searchParams.type ? `&type=${searchParams.type}` : ''}`}
                        className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 hover:text-primary-600 transition-colors shadow-sm"
                        title="Previous Page"
                      >
                        <ArrowRight size={20} className="rotate-180" />
                      </a>
                    )}
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || (p <= 7 && page <= 5) || Math.abs(p - page) <= 2)
                        .map((p, i, arr) => (
                          <div key={p} className="flex items-center">
                            {i > 0 && arr[i - 1] !== p - 1 && <span className="px-2 text-gray-400">...</span>}
                            <a
                              href={`/destinations?page=${p}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.province ? `&province=${searchParams.province}` : ''}${searchParams.type ? `&type=${searchParams.type}` : ''}`}
                              className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all ${
                                page === p
                                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                  : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-primary-600'
                              }`}
                            >
                              {p}
                            </a>
                          </div>
                        ))}
                    </div>

                    {page < totalPages && (
                      <a
                        href={`/destinations?page=${page + 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.province ? `&province=${searchParams.province}` : ''}${searchParams.type ? `&type=${searchParams.type}` : ''}`}
                        className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 hover:text-primary-600 transition-colors shadow-sm"
                        title="Next Page"
                      >
                        <ArrowRight size={20} />
                      </a>
                    )}
                  </div>
                )}
              </>
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

        {/* ══════════ Destination Spotlight ══════════ */}
        <div className="mt-20 pt-20 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-gradient-to-br from-primary-900 to-primary-950 rounded-[3rem] overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&q=80")' }} />
            <div className="relative z-10 p-10 md:p-16 flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2">
                <span className="inline-block bg-white/10 backdrop-blur-md text-white text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6">
                  Location of the Month
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                  The Enchanting<br />
                  <span className="text-primary-400">Skardu Valley</span>
                </h2>
                <div className="space-y-4 text-gray-300 text-base leading-relaxed">
                  <p>
                    Skardu, the capital of Baltistan, is perched at an altitude of 2,438 meters above sea level, nestled in the backdrop of the great Karakoram mountains. This high-altitude desert is the gateway to some of the world's highest peaks, including K2, the second-highest mountain on Earth. The valley is not just a hub for mountaineers but a treasury of history and natural wonders.
                  </p>
                  <p>
                    Visitors can explore the historic Kharphocho Fort, which has stood guard over the Indus River for centuries, or wander through the unique Katpana Cold Desert, where sand dunes are often capped with snow during the winter. The turquoise waters of Shangrila Lake (Lower Kachura) and the serene Upper Kachura Lake offer a stark contrast to the rugged mountains that surround them.
                  </p>
                  <p>
                    Skardu also holds immense cultural significance. Known as 'Little Tibet,' the region's architecture, language, and cuisine reflect a deep connection with Tibetan heritage. The local hospitality is legendary, and the bustling Skardu Bazaar is the perfect place to experience the warmth of the Balti people while sampling local dried apricots and walnuts.
                  </p>
                  <p>
                    For the adventurous at heart, a short drive from Skardu leads to the Deosai National Park — the 'Land of Giants.' This vast plateau, the second-highest in the world, is accessible only in summer and provides a sanctuary for the Himalayan Brown Bear amidst a sea of wildflowers and crystal-clear streams.
                  </p>
                </div>
                <a href="/destinations/skardu-valley" className="mt-10 inline-flex items-center gap-3 bg-white text-primary-950 px-10 py-4 rounded-full font-black hover:bg-primary-400 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                  View Details <ArrowRight size={18} />
                </a>
              </div>
              <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-8">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden relative shadow-md">
                    <img src="https://images.unsplash.com/photo-1589531100787-73d8a4369e90?auto=format&fit=crop&q=80" alt="Skardu Landscape" className="object-cover w-full h-full" />
                  </div>
                  <div className="aspect-square rounded-3xl overflow-hidden relative shadow-md">
                    <img src="https://images.unsplash.com/photo-1627664819818-e147d6221422?auto=format&fit=crop&q=80" alt="Cold Desert" className="object-cover w-full h-full" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square rounded-3xl overflow-hidden relative shadow-md">
                    <img src="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80" alt="Shangrila Lake" className="object-cover w-full h-full" />
                  </div>
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden relative shadow-md">
                    <img src="https://images.unsplash.com/photo-1544084944-152b9ec7b547?auto=format&fit=crop&q=80" alt="Khaplu Palace" className="object-cover w-full h-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ══════════ About Pakistan's Destinations ══════════ */}
      <section className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
            <div>
              <p className="section-label mb-2">Travel Guide</p>
              <h2 className="section-title mb-5">Exploring Pakistan's Regions</h2>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-4">
                Pakistan is divided into four provinces, two autonomous territories, and the Islamabad Capital Territory — each offering a completely different travel experience. Understanding the geography helps you plan more efficiently and ensures you don't miss hidden gems that lie just off the beaten path.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Whether you're a first-time visitor looking for iconic landmarks, an adventure traveller chasing K2 base camp, a history enthusiast tracing the Silk Route, or a family seeking comfortable hill station escapes — Pakistan has a destination for you. PAKEZY has curated and verified every listing on this page to give you accurate, up-to-date information for confident trip planning.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { name: 'Gilgit-Baltistan', desc: 'Home to five of the world\'s 14 eight-thousanders including K2, Nanga Parbat, and Broad Peak. A paradise for trekkers, mountaineers, and photographers. This region features the majestic Karakoram Highway, spectacular valleys like Hunza and Skardu, and the unique high-altitude cold desert of Katpana.' },
                { name: 'Punjab', desc: 'Pakistan\'s most populous province combines the grandeur of Mughal Lahore, the spiritual heart of Sufi shrines, and the fertile plains of the Indus Valley. Visitors can explore the historic Lahore Fort, the Badshahi Mosque, the ancient city of Multan, and the salt mines at Khewra.' },
                { name: 'Khyber Pakhtunkhwa', desc: 'Ancient Gandhara civilisation, the scenic Swat Valley, the historic Peshawar bazaars, and the gateway to the Hindu Kush mountain range. It is a region of rugged beauty, offering everything from the alpine meadows of Kumrat to the serene waters of Khanpur Lake.' },
                { name: 'Sindh', desc: 'The cradle of the Indus Valley Civilisation. Home to Mohenjo-daro, Thatta, the Makli Necropolis, and the vibrant megacity of Karachi on the Arabian Sea. Sindh offers a rich tapestry of history, Sufism, and a coastline with pristine beaches like Mubarak Village.' },
                { name: 'Balochistan', desc: 'Pakistan\'s largest province by area — vast deserts, towering mountains, ancient trade routes, the pristine Makran Coastal Highway, and the lunar landscape of Hingol National Park. It is the frontier of discovery, home to the deep-sea port of Gwadar and the Mud Volcanoes.' },
                { name: 'Azad Kashmir', desc: 'Lush green valleys, cascading waterfalls, and the turquoise ribbon of the Neelum River make Azad Kashmir one of Pakistan\'s most naturally beautiful regions. Points of interest include the scenic Banjosa Lake, Rawalakot, and the historic Muzaffarabad city.' },
              ].map(({ name, desc }) => (
                <div key={name} className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">{name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 pt-16 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row gap-16">
              <div className="lg:w-1/3">
                <p className="section-label mb-2">Frequently Asked</p>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6">Common Travel Questions</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Planning a trip to Pakistan involves many considerations, from visa requirements to best travel routes. Here we address some of the most frequent inquiries from both local and international travelers.
                </p>
              </div>
              <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
                {[
                  { q: "Is it safe for international tourists?", a: "Pakistan has made significant strides in tourism security. Major cities and tourist trails like the Karakoram Highway are safe and frequently visited. We recommend following local travel advisories and hiring verified guides for remote trekking." },
                  { q: "What is the primary mode of travel?", a: "Air travel is common for long distances (Islamabad to Gilgit/Skardu). For overland, dedicated tourist coaches like Daewoo operate between major cities, while private 4x4 rentals are best for mountain exploration." },
                  { q: "Are ATMs widely available?", a: "Major cities have plenty of ATMs that accept international cards. However, in northern mountain regions and remote parts of Balochistan, cash is king. Always carry enough local currency when heading away from urban hubs." },
                  { q: "What should I pack for the mountains?", a: "Layers are essential. Even in summer, nights in Gilgit-Baltistan can be cold. Pack waterproof gear, sturdy hiking boots, and high-SPF sunscreen as the sun is exceptionally strong at high altitudes." },
                  { q: "How do I find verified local guides?", a: "PAKEZY provides a platform to connect with background-checked local guides. We emphasize hiring community-based guides to support the local economy and ensure the most authentic experience." },
                  { q: "What are the visa requirements?", a: "Pakistan offers e-visas and Visa-on-Arrival (for many countries) specifically for tourism. The process is now streamlined and digital. Check the official NADRA portal for the latest requirements for your nationality." }
                ].map((faq, i) => (
                  <div key={i}>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex gap-3 text-base">
                      <span className="text-primary-600">0{i + 1}.</span> {faq.q}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════ THE KNOWLEDGE BASE (Aggressive SEO Sections) ══════════ */}
          
          <div className="mt-32 pt-20 border-t-2 border-primary-500/10">
            {/* 1. Geography of Paradise */}
            <div className="mb-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-primary-500/30 flex-grow"></div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary-600">The Geography of Paradise</h2>
                <div className="h-px bg-primary-500/30 flex-grow"></div>
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-8">
                <div className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">The Alpine North</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                    Pakistan's northern geography is defined by the meeting point of three of the world's most formidable mountain ranges: the Himalayas, the Karakorams, and the Hindu Kush. This is a region of superlative landscapes, home to over 100 peaks exceeding 7,000 meters. The sheer verticality of the terrain is awe-inspiring, with K2, the world's second-highest peak, standing as the ultimate sentinel of the north. Glacial systems here are among the most extensive outside the polar regions, with the Baltoro and Biafo glaciers carving deep valleys into the granite heart of the mountains.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                    Beyond the peaks, the northern geography includes high-altitude plateau lands like Deosai — the "Land of Giants" — which sits at an average elevation of 4,114 meters. These plateaus are ecological wonders, transforming into vibrant alpine meadows in the brief summer months. The region is also the birthplace of the Indus River, which begins its long journey southwards from the Tibetan Plateau, cutting through narrow gorges that have challenged travelers for millennia.
                  </p>
                </div>
                <div className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">The Indus Plains</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                    Moving south from the foothills of the Margalla and Salt Ranges, the geography shifts dramatically to the fertile alluvial plains of the Punjab and Sindh. This "Land of the Five Rivers" is one of the world's most productive agricultural regions, thanks to a sophisticated network of canals and the seasonal bounty of the Indus River. The terrain here is largely flat and low-lying, punctuated by historic cities that have thrived on the land's fertility for centuries.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                    The plains are not just agricultural hubs; they are also characterized by unique geographical features like the Thal and Cholistan deserts. These arid expanses represent the wild side of the plains, where nomadic cultures still endure amidst moving sand dunes and ancient fortresses. The southern reaches of the plains gradually merge into the Indus Delta, a complex system of mangrove forests and tidal flats that provide a critical habitat for diverse marine and bird life before the river finally meets the Arabian Sea.
                  </p>
                </div>
                <div className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">The Coastal South & Deserts</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                    The southern geography of Pakistan offers a stark yet beautiful contrast to the north. The Makran Coastal Highway follows a rugged shoreline characterized by pristine beaches and dramatic geological formations, such as the Sphinx of Balochistan and the Princess of Hope. These unique clay and rock structures, shaped by millennia of wind erosion, give the landscape a lunar appearance. Balochistan's vastness is its defining feature, being an arid plateau rich in mineral wealth and ancient history.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                    In the east, the Thar Desert occupies a significant portion of Sindh. One of the few inhabited deserts in the world, Tharparkar is a region where life revolves around the monsoon rains. The ecology here is surprisingly vibrant, with peacocks, gazelles, and unique desert flora. The coastal belt itself includes the vibrant megacity of Karachi, which serves as the economic lungs of the country, and the modern deep-sea port of Gwadar, representing the future of regional connectivity.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Chronicles of History */}
            <div className="mb-24">
               <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-primary-500/30 flex-grow"></div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary-600">Chronicles of History</h2>
                <div className="h-px bg-primary-500/30 flex-grow"></div>
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-8">
                <div className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">The Cradle of Civilisation</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                    Pakistan's history begins with one of the world's three earliest civilisations: the Indus Valley Civilisation. Flourishing around 3300 BCE, cities like Mohenjo-daro and Harappa featured advanced urban planning, drainage systems, and standardized building techniques that were centuries ahead of their time. The archaeological sites of Sindh and Punjab today offer a hauntingly beautiful glimpse into this Bronze Age society, whose scripts remain undeciphered but whose cultural legacy continues to influence the region's craftsmanship and town-living traditions.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                    Following the decline of the Indus Valley, the region became a crossroads for some of history's greatest empires. The Taxila valley in Punjab became a center of learning and the birthplace of the Gandhara civilisation. This unique cultural fusion of Hellenistic and Buddhist influences produced the world's most exquisite Greco-Buddhist art. Great conquerors like Alexander the Great and monarchs like Ashoka the Great left their indelible marks here, making Pakistan a primary destination for historians and archaeologists alike.
                  </p>
                </div>
                <div className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">The Mughal Grandeur</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                    The Islamic era brought about a transformation in architecture, art, and governance. The Mughal Empire, perhaps the most celebrated period of South Asian history, saw the construction of some of the most beautiful monuments in the world. Cities like Lahore became legendary for their gardens, mosques, and forts. The Badshahi Mosque, the Wazir Khan Mosque, and the Shalimar Gardens are enduring symbols of a period defined by intellectual curiosity, religious tolerance, and architectural ambition.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                    The Mughals were followed by periods of local rule, including the rise of the Sikh Empire under Maharaja Ranjit Singh, whose capital in Lahore became a vibrant center of cultural and military power. This layer of history adds another rich thread to Pakistan's heritage, with Gurdwaras and historic sites attracting thousands of yatris (pilgrims) from across the globe every year. Each wall and every brick in our historic cities tells a story of royalty, faith, and the passage of time.
                  </p>
                </div>
                <div className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Colonial Echoes & Independence</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                    The British Raj era left its own distinct mark on the geography and urban architecture of Pakistan. From the neo-Gothic buildings of Lahore's Mall Road to the planned hill stations like Murree and Abbottabad, colonial history is visible throughout the country. This period also saw the development of one of the world's largest irrigation networks and the introduction of a railway system that still serves as a vital artery for the nation.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                    The 20th century was defined by the struggle for independence and the Pakistan Movement, led by Muhammad Ali Jinnah. The creation of Pakistan in 1947 was a monumental event in modern history, marking the birth of a nation based on a unique ideological and cultural identity. Today's Pakistan is a vibrant young country built on these ancient foundations, constantly evolving while remaining deeply rooted in its glorious and complex past.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Cultural Tapestry */}
            <div className="mb-24">
               <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-primary-500/30 flex-grow"></div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary-600">The Cultural Tapestry</h2>
                <div className="h-px bg-primary-500/30 flex-grow"></div>
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-8">
                <div className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hospitality as a Creed</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                    If there is one defining characteristic that unites all Pakistanis, it is their legendary hospitality. Derived from the ancient traditions of the Silk Road and reinforced by religious values, welcoming travelers is considered a sacred duty. Whether you are in the bustling neighborhoods of Karachi or a remote shepherd's hut in the upper Hunza, you will likely be greeted with "Assalamu Alaikum" and an invitation for tea.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                    This warmth is not just a gesture; it's a way of life. Travelers often find that the most memorable parts of their journey aren't the majestic peaks or historic forts, but the conversations over "Chai" and the generosity of complete strangers. At PAKEZY, we believe that understanding this cultural core is essential for a respectful and rewarding travel experience in Pakistan.
                  </p>
                </div>
                <div className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Linguistic Richness</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                    Pakistan is a polyglot nation with dozens of languages and hundreds of dialects spoken across its length and breadth. While Urdu serves as the national language and English as the official language, each province boasts its own rich linguistic heritage. Punjabi, Pashto, Sindhi, and Balochi are the major regional languages, each with a profound literary and poetic tradition.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                    In the north, ancient and rare languages like Shina, Burushaski, and Khowar are spoken, some of which are linguistic isolates with roots going back thousands of years. This diversity is celebrated through music and poetry, from the soul-stirring Qawwali of the plains to the rhythmic folk dances of the mountains. Learning just a few words of the local tongue can open doors and hearts throughout your journey.
                  </p>
                </div>
                <div className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Arts & Craftsmanship</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                    The artisanal traditions of Pakistan are a vibrant reflection of its diverse history. From the intricate blue pottery of Multan to the exquisite hand-woven shawls of Kashmir, the country is a treasure trove for craft enthusiasts. Truck Art, a unique psychodelic pop-art form that has gained international fame, transforms highways into moving art galleries, showcasing local humor, poetry, and folk motifs.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                    Embroidery styles vary by region — the colorful "Phulkari" of Punjab, the intricate "Ralli" quilts of Sindh, and the delicate needlework of Swat each tell a story of their origin. Jewelry making, woodwork, and copperware are other ancient skills that have been passed down through generations. Supporting local artisans by purchasing these handmade treasures is a direct way for travelers to contribute to the preservation of Pakistan's intangible cultural heritage.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Ultimate Traveler's Handbook */}
            <div className="mb-24">
               <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-primary-500/30 flex-grow"></div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary-600">Traveler's Handbook</h2>
                <div className="h-px bg-primary-500/30 flex-grow"></div>
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-8">
                <div className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">When to Go?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                    Planning the timing of your visit is crucial due to Pakistan's diverse climate. For the high mountains of the north, the sweet spot is between June and September when all passes are open and trekking routes are accessible. The fall (September and October) brings spectacular colors to the Hunza and Nagar valleys, making it a photographer's dream.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                    The plains of Punjab and Sindh, along with the cities of Karachi and Lahore, are best explored during the winter months from November to March when the weather is mild and pleasant. Avoid these areas in the peak of summer (May to July) when temperatures can exceed 45°C. For those interested in religious festivals, checking the Islamic lunar calendar is important as it dictates the dates for Eid and various Sufi Urs (festivals).
                  </p>
                </div>
                <div className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Logistics & Practicalities</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                    Modern Pakistan is increasingly well-connected. A network of motorways links major cities like Karachi, Lahore, and Islamabad, while domestic flights serve destinations as diverse as Gwadar and Skardu. For mountain travel, 4x4 vehicles are the gold standard, often requiring skillful local drivers who understand the nuances of unpaved mountain roads. Public transport options like Daewoo and Faisal Movers provide reliable inter-city bus services.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                    Communications are straightforward with local SIM cards (Jazz, Zong, or Telenor) being affordable and easily available for tourists. While internet connectivity is excellent in cities, it can be spotty in deep mountain valleys. Carrying cash (Pakistani Rupees) is essential, especially when leaving major hubs, as many businesses in tourist destinations do not yet accept international cards or mobile payments.
                  </p>
                </div>
                <div className="break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Etiquette & Respect</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 text-justify">
                    Respecting local customs is the key to an enriching journey. Modest dress is recommended, especially in rural areas and when visiting religious sites. Removing shoes before entering homes and mosques is standard practice. While Pakistanis are generally very forgiving of foreigners' cultural blunders, making an effort to follow these simple norms goes a long way.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                    In terms of photography, always ask for permission before taking portraits of people, particularly women in conservative areas. It's also polite to decline an invitation for tea three times before accepting (as per the local custom of 'Takalluf'), though most locals will insist until you say yes! Alcohol is not publicly sold or consumed, and it's important to be mindful of this during your travels through this culturally rich and diverse nation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════ THE ULTIMATE TRAVEL ENCYCLOPEDIA (Phase 3 SEO Injection) ══════════ */}
          
          <div className="mt-32 pt-32 border-t-4 border-primary-500/5 bg-gray-50/50 dark:bg-gray-900/10 -mx-4 px-4 pb-32">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <span className="text-primary-600 font-black uppercase tracking-[0.4em] text-xs mb-4 block">The Comprehensive Guide</span>
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-8">Ultimate Travel Encyclopedia</h2>
                <p className="text-gray-500 max-w-3xl mx-auto text-lg leading-relaxed">
                  Welcome to the most exhaustive digital resource for traveling across Pakistan. Our encyclopedia covers every facet of the Pakistani experience, from the ancient Silk Route corridors to the modern culinary revolutions in our megacities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                
                {/* Section A: Festivals & Traditions */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black text-primary-600 mb-6 border-b-2 border-primary-500/20 pb-2">Festivals & Ancient Traditions</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 text-justify">
                      Pakistan's cultural calendar is a vibrant mosaic of religious, seasonal, and regional festivals that date back centuries. Among the most spectacular is the Shandur Polo Festival, held annually at the world's highest polo ground (3,700 meters) between Chitral and Gilgit. This isn't just a sport; it's a "freestyle" polo tradition that remains unchanged since the era of kings. The crowd, the high-altitude atmosphere, and the raw energy of the horses make it a bucket-list experience for any traveler.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 text-justify">
                      In the plains of Punjab, the festival of Mela Chiraghan (The Festival of Lights) honors the Sufi poet Madhu Lal Hussain. Thousands of pilgrims gather at the Shalimar Gardens, lighting lamps and performing "Dhamal" to the rhythmic beat of large drums (Dhols). Similarly, the Urs of Lal Shahbaz Qalandar in Sehwan, Sindh, attracts millions of devotees in a spiritual frenzy of dance and devotion that transcends social boundaries. These festivals are the heartbeat of Pakistan's spiritual diversity.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 text-justify">
                       The North also celebrates seasonal shifts with unique festivals like "Ghinani" in Hunza, marking the start of the harvest, and the various Kalasha festivals (Chilam Joshi, Phoo, and Chowmos) in the valleys of Chitral. The Kalasha people, an ethnic minority with distinct Hellenistic roots, celebrate with ancient rhythmic dances, community singing, and the offering of seasonal produce to their ancestral deities. These traditions offer a rare window into a culture that has preserved its identity for over two millennia amidst the high peaks of the Hindu Kush.
                    </p>
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-900 dark:text-white mb-4">Navroz & Spring Welcoming</h4>
                     <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                       Navroz (the Persian New Year) is celebrated with great fervor in Gilgit-Baltistan and parts of Balochistan. Symbolizing rebirth and renewal, it involves the cleaning of homes, the preparation of special "Haft-Sin" inspired platters, and community competitions like traditional wrestling and archery. The arrival of spring in Pakistan is not just a change in weather; it is a spiritual and cultural awakening celebrated with flowers, fairs (like the Horse and Cattle Show in Lahore), and the flying of colorful kites during Basant (where still permitted).
                     </p>
                  </div>
                </div>

                {/* Section B: Culinary Heritage */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black text-primary-600 mb-6 border-b-2 border-primary-500/20 pb-2">A Culinary Odyssey</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 text-justify">
                      Pakistani cuisine is as diverse as its geography, representing a multi-layered history of Persian, Central Asian, and South Asian influences. At the heart of it is the Biryani — specifically the aromatic Sindhi Biryani and the spicy Karachi variant — which has become the unofficial national dish. The secret lies in the "Dum" cooking method, where layers of parboiled rice, slow-cooked meat, and a blend of over 20 spices are sealed together to infuse their flavors in a final stage of steaming.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 text-justify">
                      In the rugged west and north, the flavor profile shifts from spicy to savory. The "Sajji" of Balochistan — a whole lamb or chicken skewered and roasted over a slow charcoal fire — is seasoned only with salt and perhaps a hint of green papaya for tenderness. Similarly, the "Chapli Kebab" of Khyber Pakhtunkhwa is a masterpiece of Pashtun culinary art, where minced beef is mixed with dried pomegranate seeds, fresh tomatoes, and bone marrow before being shallow-fried in animal fat to a crispy perfection.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 text-justify">
                      Lahore is often cited as the food capital of Pakistan, famous for its "Food Streets" where history and hunger meet. One cannot claim to have visited Lahore without trying the breakfast of "Halwa Puri" or the slow-cooked "Nihari," a rich beef stew that was traditionally eaten by the Mughal royals after early morning prayers. The city's legendary "Butt Karahi" and "Lassi" are not just meals; they are cultural institutions that draw thousands of food pilgrims to the old city every night.
                    </p>
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-900 dark:text-white mb-4">Street Food & Teas</h4>
                     <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                       Beyond the main courses, Pakistan's street food culture is legendary. From the "Bun Kabab" of Karachi's Burns Road to the "Falooda" of Kasur, there is a snack for every street corner. Tea (Chai) is the glue that holds the nation together. Whether it's the "Doodh Patti" (strong milk tea) of the highways, the "Kashmiri Chai" (pink salted tea) of the north, or the "Peshawari Kahwa" (green tea with cardamom), tea is always served as a gesture of welcome and a catalyst for conversation.
                     </p>
                  </div>
                </div>

                {/* Section C: Wildlife & Conservation */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black text-primary-600 mb-6 border-b-2 border-primary-500/20 pb-2">Wildlife & Modern Conservation</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 text-justify">
                      Pakistan's vast ecological range makes it a sanctuary for rare and endangered wildlife. The Snow Leopard, the "Ghost of the Mountains," haunts the high ridges of the Karakoram and Hindu Kush ranges. Conservation efforts in Khunjerab National Park have been internationally recognized for involving local communities in the protection of these elusive cats. Similarly, the Himalayan Brown Bear finds its last stronghold on the Deosai Plains, where a dedicated park management system has helped their population stabilize and grow.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 text-justify">
                      In the waters of the Indus River, the Indus Blind Dolphin (locally known as the Bhulan) is one of the world's most unique freshwater mammals. These functionally blind dolphins rely on echolocation to navigate the murky river waters. Conservation programs in Sindh have been vital in preventing their extinction due to pollution and river dams. Along the coast of Balochistan, Hingol National Park serves as a critical habitat for the Ibex, Urial, and various migratory birds that travel from as far as Siberia during the winter months.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 text-justify">
                      Pakistan's commitment to "Green Growth" is evident in the "Ten Billion Tree Tsunami" project, which aims to restore depleted forests and combat climate change. Ecotourism is the new frontier for Pakistan, and at PAKEZY, we prioritize destinations that practice sustainable tourism. By visiting protected areas like the Margalla Hills National Park or the wetlands of Haleji, travelers contribute directly to the "Green Economy," ensuring that Pakistan's natural heritage remains intact for future generations to explore and cherish.
                    </p>
                  </div>
                  <div>
                     <h4 className="font-bold text-gray-900 dark:text-white mb-4">The Markhor: Our National Pride</h4>
                     <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                       The Markhor, an iconic species of wild goat with spectacular corkscrew horns, is the national animal of Pakistan. Once on the brink of extinction, its recovery is a global conservation success story. Community-based trophy hunting programs (where only old males are harvested) have provided immense financial incentives for local villages to protect the species from poaching. Today, Markhor populations are thriving in northern KP and Gilgit-Baltistan, symbolizing the successful marriage of traditional hunting cultures and modern conservation science.
                     </p>
                  </div>
                </div>
              </div>

              {/* Mega-Block: The Silk Route Legend */}
              <div className="mt-24 p-12 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-8 text-center italic">"The Legacy of the Silk Route"</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed text-justify">
                      For over two millennia, the territory that is now Pakistan was the beating heart of the Silk Route — the world's most significant ancient trade network. This wasn't just a single road, but a complex web of mountain passes, river crossings, and oasis towns that connected the Han dynasty of China with the Roman Empire. The Karakoram Highway today follows one of the most treacherous yet beautiful arms of this ancient path, crossing the Khunjerab Pass at 4,693 meters.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed text-justify">
                      Caravansaries (Inns for caravans) like the ones in the Taxila valley and Peshawar were melting pots of civilization. Here, Buddhist monks from Magadha met Greek architects from Bactria, and Sogdian traders from Samarkand bartered with local merchants. This constant exchange of ideas, technologies, and religions (specifically the spread of Buddhism to East Asia via the Gandhara corridor) makes the Silk Route history of Pakistan a globally significant heritage.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed text-justify">
                      The legacy of the Silk Route is alive in the "Bazaars" of our historic cities. Whether you are in Qissa Khwani (the Street of Storytellers) in Peshawar or the Raja Bazaar of Rawalpindi, you are witnessing a commercial tradition that has remained virtually unchanged for centuries. The spices, the precious stones from the northern mines, and the hand-knotted carpets still find their way across these ancient routes, now bolstered by modern infrastructure like the China-Pakistan Economic Corridor (CPEC).
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed text-justify">
                      At PAKEZY, we invite you to be more than just a tourist; we invite you to be a modern-day traveler on the Silk Route. Every step you take in our northern valleys is a step back in time, following in the footsteps of explorers like Marco Polo and Ibn Battuta. Our mission is to preserve the stories, the monuments, and the timeless spirit of these ancient pathways, ensuring that the Legend of the Silk Route continues to inspire the global imagination.
                    </p>
                  </div>
                </div>
                <div className="mt-12 text-center">
                   <div className="inline-block px-10 py-4 bg-primary-600 text-white font-black rounded-full shadow-xl transform transition hover:scale-105 active:scale-95 cursor-pointer">
                      Download the Full 500-Page Guide
                   </div>
                   <p className="mt-4 text-xs text-gray-400">Join over 1,000,000+ travelers who have explored Pakistan with our comprehensive knowledge base.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
