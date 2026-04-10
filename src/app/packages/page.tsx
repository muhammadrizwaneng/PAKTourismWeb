import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Search, MapPin, Clock, Users, ArrowRight, Package } from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';

const PAGE_SIZE = 12;

async function getPackages(search?: string, maxPrice?: string, page: number = 1) {
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

  const [packages, totalCount] = await Promise.all([
    prisma.tourPackage.findMany({
      where,
      select: {
        id: true,
        title: true,
        price: true,
        durationDays: true,
        maxPeople: true,
        featuredImage: true,
        isFeatured: true,
        destination: {
          select: {
            title: true,
          },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { price: 'asc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.tourPackage.count({ where }),
  ]);

  return { packages, totalCount };
}

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: { search?: string; maxPrice?: string; page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const { packages, totalCount } = await getPackages(searchParams.search, searchParams.maxPrice, page);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
          <p className="text-gray-400 max-w-2xl text-lg leading-relaxed mb-3">
            All-inclusive itineraries crafted by expert local guides. Book once, worry never. Each PAKTourism package covers accommodation, transport, guided excursions, and entry fees — giving you a complete Pakistan experience without the logistics overhead.
          </p>
          <p className="text-gray-500 max-w-2xl text-base leading-relaxed mb-10">
            From three-day cultural weekends in Lahore to fifteen-day Karakoram expeditions, our packages span every province, every budget, and every travel style. Every itinerary is designed and priced by guides who live and work in the destination — not by a call centre thousands of kilometres away.
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
        <div className="flex justify-between items-center mb-10">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            Found <span className="text-gray-900 dark:text-white">{totalCount}</span> Adventure Packages
          </p>
          <div className="h-px bg-gray-100 dark:bg-gray-800 flex-grow mx-8 hidden md:block" />
          <div className="text-xs font-bold text-gray-400">Page {page} of {totalPages || 1}</div>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-950 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
            <Package size={56} className="mx-auto text-gray-300 dark:text-gray-700 mb-6" />
            <p className="text-xl font-black text-gray-900 dark:text-white">No packages found</p>
            <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">We couldn't find any adventure itineraries matching your criteria. Try adjusting your search or price range.</p>
            <Link href="/packages" className="mt-8 inline-block bg-primary-600 text-white px-8 py-3 rounded-full font-bold">
              Browse All Packages
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg: any) => (
                <Link key={pkg.id} href={`/packages/${pkg.id}`} className="group block h-full">
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
                      <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                        Embark on a curated journey through Pakistan's most legendary landscapes. Our expert-led expeditions combine authentic cultural encounters with breathtaking natural wonders.
                      </p>
                      <div className="flex gap-5 mb-4 mt-auto">
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                          <Clock size={13} className="mr-1.5 text-primary-500" />
                          {pkg.durationDays}D / {pkg.durationDays - 1}N
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                          <Users size={13} className="mr-1.5 text-primary-500" />
                          Max {pkg.maxPeople || 10}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <span className="text-gray-400 text-[10px] uppercase font-bold block">Starts From</span>
                          <span className="text-xl font-black text-primary-600">PKR {pkg.price.toLocaleString()}</span>
                        </div>
                        <span className="flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-xs font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors">
                          Details <ArrowRight size={13} className="ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                {page > 1 && (
                  <a
                    href={`/packages?page=${page - 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.maxPrice ? `&maxPrice=${searchParams.maxPrice}` : ''}`}
                    className="p-3 rounded-xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-gray-600 hover:text-primary-600 transition-colors shadow-sm"
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
                          href={`/packages?page=${p}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.maxPrice ? `&maxPrice=${searchParams.maxPrice}` : ''}`}
                          className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all ${
                            page === p
                              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                              : 'bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-primary-600'
                          }`}
                        >
                          {p}
                        </a>
                      </div>
                    ))}
                </div>

                {page < totalPages && (
                  <a
                    href={`/packages?page=${page + 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.maxPrice ? `&maxPrice=${searchParams.maxPrice}` : ''}`}
                    className="p-3 rounded-xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-gray-600 hover:text-primary-600 transition-colors shadow-sm"
                    title="Next Page"
                  >
                    <ArrowRight size={20} />
                  </a>
                )}
              </div>
            )}
          </>
        )}

        {/* ══════════ THE ADVENTURE ENCYCLOPEDIA (SEO Overhaul) ══════════ */}
        <section className="mt-40 space-y-32">
          
          {/* Section 1: The Golden Age of Adventure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl mt-12">
                  <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80" alt="Mountain Trekking" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1594406830530-81f1896a2468?auto=format&fit=crop&q=80" alt="Cultural Explorer" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-primary-600 font-black uppercase tracking-[0.4em] text-xs mb-4 block">Historical Narrative</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-8 leading-tight">The Golden Age of Pakistani Adventure</h2>
              <div className="space-y-6 text-gray-600 dark:text-gray-400 text-base leading-relaxed text-justify">
                <p>
                  Pakistan has long been the "holy grail" for mountaineers and world travelers. From the early explorations of the Karakoram by colonial cartographers to the first ascent of K2 in 1954, these lands have defined the limits of human endurance and curiosity. Our tour packages are designed to carry forward this legacy, offering modern adventurers a structured way to experience the same awe-inspiring landscapes that captivated the pioneers of high-altitude exploration.
                </p>
                <p>
                  Beyond the high peaks, the "Golden Age" of adventure in Pakistan is also about the deep cultural rivers that flow through the Indus Valley. Our itineraries are crafted to mirror the ancient pilgrimage routes and trade corridors that once connected the Gandharan civilizations with the empires of the West. When you book a package through PAKTourism, you aren't just taking a holiday; you are walking through the pages of living history.
                </p>
                <p>
                  Today, adventure in Pakistan is undergoing a renaissance. With improved road networks like the Karakoram Highway and a new generation of certified local guides, remote valleys like Shimshal and Hushe have become accessible to those with a spirit of discovery. We pride ourselves on working with operators who respect these lands, ensuring that the adventure of today doesn't compromise the beauty of tomorrow.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Anatomy of an Expedition */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary-600 -skew-y-3 rounded-[4rem] z-0 shadow-2xl shadow-primary-500/20" />
            <div className="relative z-10 px-8 py-20 md:p-24 grid grid-cols-1 lg:grid-cols-3 gap-16 text-white">
              <div className="lg:col-span-2">
                <span className="text-primary-200 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Expedition Standards</span>
                <h2 className="text-4xl font-black mb-8 leading-tight">The Anatomy of a Perfect Expedition</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">01</div>
                      Logistical Precision
                    </h3>
                    <p className="text-primary-100 text-sm leading-relaxed text-justify">
                      Traveling in Pakistan requires meticulous planning. Our packages handle the complex bureaucracy of permits, the volatility of mountain logistics, and the necessity of reliable local transport. We use private 4WD vehicles and experienced mountain drivers who navigate the terrain with surgical precision.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">02</div>
                      Safety & First Aid
                    </h3>
                    <p className="text-primary-100 text-sm leading-relaxed text-justify">
                      Safety is our non-negotiable standard. Every expedition team is equipped with a comprehensive first-aid kit, and guides are trained in wilderness first-response. We maintain 24/7 communications with local authorities and have established evacuation protocols for remote trekking regions.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">03</div>
                      Authentic Connectivity
                    </h3>
                    <p className="text-primary-100 text-sm leading-relaxed text-justify">
                      An expedition's soul lies in its connection to the people. We prioritize homestays and community-run lodges that ensure your tourism dollars directly support local families. This "Bottom-Up" approach to travel provides you with the most authentic insights into regional traditions.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">04</div>
                      Responsible Exploration
                    </h3>
                    <p className="text-primary-100 text-sm leading-relaxed text-justify">
                      We follow strict 'Leave No Trace' principles. From plastic-free trekking to respecting cultural sensitivities in religious sites, our packages are designed to be low-impact and high-yield for the host communities, preserving Pakistan's heritage for future generations.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 flex flex-col justify-center text-center">
                 <Package size={48} className="mx-auto mb-6 text-primary-200" />
                 <h3 className="text-2xl font-black mb-4 tracking-tighter">Ready for the Journey?</h3>
                 <p className="text-sm text-primary-50 mb-8 leading-relaxed">Join over 10,000+ adventurers who have discovered the majesty of Pakistan through our verified operators.</p>
                 <button className="w-full bg-white text-primary-600 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primary-50 transition-colors">Start Planning</button>
              </div>
            </div>
          </div>

          {/* Section 3: Seasonal Itinerary Guide */}
          <div className="space-y-20">
            <div className="text-center">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">The Definitive Seasonal Calendar</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">Understanding Pakistan's climate is critical to selecting the right package. Each season offers a fundamentally different experience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  season: 'Spring',
                  months: 'March — May',
                  focus: 'Blossom & Culture',
                  desc: 'Perfect for the apricot and cherry blossoms in Hunza and Skardu. Spring is also the prime time for heritage tours in Punjab and spiritual journeys during the Sufi festivals.'
                },
                {
                  season: 'Summer',
                  months: 'June — August',
                  focus: 'High Peaks & Lakes',
                  desc: 'The only window for high-altitude trekking and crossing mountain passes like Babusar or Shandur. Essential for those visiting Saif-ul-Malook or Deosai National Park.'
                },
                {
                  season: 'Autumn',
                  months: 'Sept — Nov',
                  focus: 'Photographic Gold',
                  desc: 'The fall colors of Gilgit-Baltistan are legendary. This season offers stable weather, clear skies, and a landscape of burning oranges and deep reds—pure gold for photographers.'
                },
                {
                  season: 'Winter',
                  months: 'Dec — Feb',
                  focus: 'South & Coast',
                  desc: 'Escape the cold by heading to the warm shores of Balochistan or the architectural wonders of Sindh. Winter is also the best time to explore the Silk Route cities without the summer heat.'
                }
              ].map((s) => (
                <div key={s.season} className="p-8 rounded-[2rem] bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 group hover:border-primary-500/30 transition-all">
                  <div className="text-[10px] font-black uppercase text-primary-600 mb-2 tracking-widest">{s.months}</div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{s.season}</h3>
                  <div className="h-0.5 w-10 bg-primary-500 mb-6 group-hover:w-full transition-all duration-500" />
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-200 mb-3 uppercase tracking-tighter">{s.focus}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed text-justify">{s.desc}</p>
                </div>
              ))}
            </div>
            
            {/* Added context for various provinces */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[3rem] p-12 md:p-20 border border-gray-100 dark:border-gray-800">
               <div className="max-w-4xl mx-auto space-y-12">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Understanding Package Complexity</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                      Our packages are tiered into three distinct levels of complexity: <strong>'Cultural Immersive'</strong> focuses on ease of access, heritage sites, and premium comfort; <strong>'Soft Adventure'</strong> introduces light trekking and travel into more remote valleys while maintaining stable infrastructure; <strong>'Expedition Grade'</strong> is designed for serious hikers and mountaineers requiring full logistical support, porting teams, and high-altitude gear. 
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">The Value of Group Dynamics</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                      Many of our packages are group-based, fostering a sense of community among international and domestic travelers. We strictly limit group sizes (typically max 10-12 people) to ensure that we do not overwhelm local communities and to maintain a personal connection between the guide and each participant. For those seeking absolute privacy, any listed itinerary can be customized into a private VIP package upon request.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Financial Security & Guarantees</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
                      Booking through PAKTourism means your financial investment is secure. We only work with licensed tour operators who have established track records and local registrations. Our platform acts as a bridge of trust, ensuring that the services described in your itinerary are exactly what you experience on the ground.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </div>

      {/* Package types section */}
      <section className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-3">Browse By Interest</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-10">Types of Tour Packages Available in Pakistan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {([
              {
                title: 'Mountain Trekking Packages',
                body: 'Pakistan\'s northern mountains are the premier trekking destination in Asia. Our trekking packages range from the accessible Margalla Hills day hikes around Islamabad to the K2 Base Camp expedition in Gilgit-Baltistan — one of the most demanding and spectacular multi-week treks in the world. Intermediate options include the Fairy Meadows trek to the Nanga Parbat base camp, the Rakaposhi base camp trail, the Gondogoro La crossing, and the Haramosh Valley circuit. All mountain packages include altitude sickness protocols, experienced high-altitude guides, and porter arrangements.',
              },
              {
                title: 'Cultural Heritage Tours',
                body: 'Pakistan\'s cultural heritage tours follow the great civilisational corridors of South and Central Asia. A Punjab heritage circuit typically covers Lahore Fort, the Badshahi Mosque, the Wazir Khan Mosque, Shalimar Gardens, Anarkali Bazaar, Rohtas Fort, and the ancient Buddhist university ruins of Taxila — all within a comfortable five-day itinerary. Sindh heritage tours take travellers through Mohenjo-daro, the Makli Necropolis, the Ranikot Fort (the world\'s largest), and the Sufi shrines of the lower Indus Valley. Gandharan heritage tours in KPK cover the Buddhist monasteries of Swat, the Peshawar Museum, and Takht-i-Bahi.',
              },
              {
                title: 'Valley & Scenic Nature Packages',
                body: 'Pakistan\'s valleys are among the most photogenic landscapes in Asia. Our valley packages range from three-night Swat Valley retreats — covering Mingora, Malam Jabba, Fizagat, and Kalam — to extended Hunza-Skardu circuits that take travellers through the apricot orchards of Hunza, the turquoise shores of Attabad Lake, the Karakoram Highway\'s most dramatic stretches, and the high-altitude polo grounds of Shandur. Neelum Valley packages in Azad Kashmir are perennially popular for their lush pine forests, glacial rivers, and relative accessibility from Islamabad.',
              },
              {
                title: 'Jeep Safari & Road Trip Packages',
                body: 'The Karakoram Highway is widely considered the world\'s greatest road trip, traversing almost 1,300 kilometres from Islamabad to the Khunjerab Pass on the Chinese border. Our KKH road trip packages typically run seven to ten days and include stops at Taxila, Besham, Chilas (home to thousands of ancient rock carvings), Gilgit, the Hunza Valley, Gulmit, Passu, and the glacier viewpoints near Gojal. For adventurous travellers, we also offer Makran Coastal Highway jeep safaris, taking in the dramatic Balochistan coastline, the mud volcanoes of Hingol, and the Princess of Hope rock formation.',
              },
              {
                title: 'Luxury & Boutique Tour Packages',
                body: 'Pakistan\'s luxury tourism sector has grown significantly in recent years, with boutique hotels and eco-lodges opening across Hunza, Skardu, Swat, and Lahore. Our luxury packages are designed for travellers who want the adventure of Pakistan\' mountain landscapes combined with the comfort of high-end accommodation, private vehicle transfers, and fine dining experiences. Signature luxury offerings include a private Hunza Heritage & Hospitality tour staying at the Serena Hunza and Rakaposhi View Hotel, and a Lahore Cultural Immersion package with exclusive evening access to Lahore Fort and a heritage haveli dining experience.',
              },
              {
                title: 'Family & Group Tour Packages',
                body: 'Pakistan is an exceptionally welcoming destination for families and groups. Our family packages prioritise comfort, age-appropriate activity levels, and destinations with reliable infrastructure. Popular family routes include the Murree-Nathiagali hill station circuit, the Shogran and Keran Valley family escape, and the Lahore-Islamabad cultural tour combining Lahore Fort, the Lok Virsa Museum, Pakistan Monument, and the Shakarparian rose garden. School group packages with educational components covering Pakistani history, Islamic architecture, and natural science are available with advance booking.',
              },
            ] as { title: string; body: string }[]).map(({ title, body }) => (
              <div key={title} className="space-y-3">
                <h3 className="text-base font-black text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-3">Common Questions</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-10">Frequently Asked Questions About Pakistan Tour Packages</h2>
          <div className="space-y-8">
            {([
              {
                q: 'How far in advance should I book a Pakistan tour package?',
                a: 'For summer trekking packages (June–September) in Gilgit-Baltistan and KPK, we recommend booking at least 3–4 months in advance, as accommodation in popular valleys like Hunza fills up quickly. Cultural heritage tours in Punjab and Sindh, which run year-round, can typically be arranged with 3–4 weeks\' notice. For the K2 Base Camp trek specifically, applications for the required permits must be filed 4–6 months ahead of the intended start date.',
              },
              {
                q: 'Are the package prices per person or per group?',
                a: 'All PAKTourism package prices are quoted per person, based on the group size specified in the listing. Most packages show pricing for groups of 2–4 people. Solo travellers are welcome on all packages but may pay a single-supplement surcharge to cover the fixed costs of private transport and accommodation. For large groups (8 or more people), contact us directly for bespoke group pricing, which typically offers a 10–15% saving over the listed per-person rate.',
              },
              {
                q: 'What happens if the weather disrupts the itinerary?',
                a: 'Weather disruptions — particularly road closures from landslides and flash floods in the northern mountains — are a real possibility during the June and July monsoon period. All PAKTourism packages include a guaranteed rebooking credit valid for 12 months if a disruption results in more than one missed scheduled day of activities. Our on-ground guides carry satellite communication devices and have established protocols for safe diversions and emergency accommodation in the most remote trekking areas.',
              },
              {
                q: 'Do I need travel insurance to book a Pakistan tour package?',
                a: 'Travel insurance with medical evacuation cover is strongly recommended for all mountain and trekking packages. For high-altitude treks above 5,000 metres — particularly the K2 Base Camp, Gondogoro La, and Nanga Parbat circuits — comprehensive insurance including helicopter evacuation cover is effectively a requirement. For cultural tours in cities and lowland areas, standard travel insurance covering cancellation, medical, and personal liability is sufficient. We recommend World Nomads or Allianz Travel for international visitors.',
              },
              {
                q: 'What level of fitness is required for PAKTourism packages?',
                a: 'Fitness requirements vary widely by package type. City and cultural heritage tours require only basic mobility — comfortable walking for 4–6 hours per day on even surfaces. Valley packages with gentle village-to-village walks require moderate fitness. High-altitude trekking packages above 4,000 metres require good cardiovascular fitness, established hiking experience, and the ability to carry a day pack for 6–8 hours. K2 Base Camp packages require expedition-level fitness with multi-day trekking experience at altitude. Each package listing specifies the fitness level required.',
              },
              {
                q: 'Can dietary requirements be accommodated?',
                a: 'Yes. Pakistani cuisine is naturally diverse and accommodating of most dietary needs. Vegetarian and vegan options are available across virtually all regions — daal, sabzi, chana, rice, and bread-based meals are staples. Halal food is standard. Gluten-free requirements can be met with advance notice in most areas, though strict gluten intolerance is harder to guarantee in very remote mountain guesthouses where cross-contamination cannot be fully controlled. Inform your guide of all dietary requirements at the time of booking.',
              },
              {
                q: 'What currency is used and how much spending money should I budget?',
                a: 'Pakistan uses the Pakistani Rupee (PKR). At current exchange rates, USD 1 ≈ PKR 280. ATMs are reliable in cities and towns, but very limited or non-existent in remote mountain areas — carry sufficient PKR cash before departing urban centres for any trekking or rural tour. Budget an additional PKR 2,000–4,000 per day for personal purchases, tips for porters and guesthouse staff, and optional local activities not included in your package price.',
              },
              {
                q: 'Can PAKTourism create a custom itinerary for us?',
                a: 'Absolutely. Many of our most popular packages started as custom requests before being added to the standard directory. We offer bespoke itinerary design for groups travelling to any region of Pakistan, combining elements from our existing packages or building entirely new routes. Custom itineraries are particularly popular for honeymoon tours, photography expeditions, corporate team-building retreats, and extended multi-region journeys covering three or more provinces. Contact us with your dates, group size, interests, and budget, and we\'ll respond with a detailed proposal within 48 hours.',
              },
            ] as { q: string; a: string }[]).map(({ q, a }, i) => (
              <div key={i} className="border-b border-gray-200 dark:border-gray-800 pb-8 last:border-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">{q}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
