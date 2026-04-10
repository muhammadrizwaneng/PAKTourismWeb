import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Search, MapPin, Clock, Ticket, ArrowRight, Compass, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';
import { parseJson } from '@/lib/utils';

const PAGE_SIZE = 24;

type AttractionWithRelations = Awaited<ReturnType<typeof getAttractions>>['items'][number];

async function getAttractions(search: string | undefined, page: number) {
  const where = search ? {
    OR: [
      { title: { contains: search } },
      { description: { contains: search } },
    ],
  } : {};

  const [items, total] = await Promise.all([
    prisma.attraction.findMany({
      where,
      include: { destination: true, taxonomy: true },
      orderBy: [
        { destination: { province: 'asc' } },
        { destination: { title: 'asc' } },
        { title: 'asc' },
      ],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.attraction.count({ where }),
  ]);

  return { items, total };
}

async function getStats() {
  const [total, provinces, categories] = await Promise.all([
    prisma.attraction.count(),
    prisma.attraction.findMany({ distinct: ['destinationId'], select: { destination: { select: { province: true } } } }),
    prisma.taxonomy.count({ where: { type: 'attraction' } }),
  ]);
  const uniqueProvinces = new Set(provinces.map((a: (typeof provinces)[number]) => a.destination.province)).size;
  return { total, uniqueProvinces, categories };
}

export default async function AttractionsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const [{ items: attractions, total }, stats] = await Promise.all([
    getAttractions(searchParams.search, page),
    getStats(),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Group current page's items by province for section headings
  const provinceMap = new Map<string, AttractionWithRelations[]>();
  for (const attr of attractions) {
    const prov = attr.destination.province || 'Other';
    const arr = provinceMap.get(prov) ?? [];
    arr.push(attr);
    provinceMap.set(prov, arr);
  }
  const attractionsByProvince = Array.from(provinceMap.entries()).map(([province, items]) => ({ province, items }));

  const provinceDescriptions: Record<string, string> = {
    'Gilgit-Baltistan': "The roof of the world. Gilgit-Baltistan is home to five of the planet's 14 eight-thousanders, including K2, Nanga Parbat, and Gasherbrum. Its sweeping glacier valleys, turquoise lakes, ancient Silk Road forts, and warm Shina and Balti communities make it the crown jewel of Pakistan's adventure tourism.",
    'Punjab': "The cultural heartland of Pakistan. Punjab's attractions span 5,000 years — from the Mughal splendour of the Lahore Fort and Badshahi Mosque to the Sufi shrines of Data Darbar and the ancient Buddhist university ruins of Taxila. The province's vibrant bazaars, street food scene, and festivals draw millions of visitors every year.",
    'Khyber Pakhtunkhwa': "The gateway to the Hindu Kush. KPK's attractions blend ancient Gandharan heritage with stunning natural scenery. The green Swat Valley's Buddhist ruins, the charismatic bazaars of Peshawar, the serene Kaghan Valley, and the dramatic Chitral mountains offer experiences found nowhere else in South Asia.",
    'Sindh': "The cradle of civilisation. Sindh is home to Mohenjo-daro — a 4,500-year-old UNESCO World Heritage city and one of the world's first planned urban settlements. The province also holds the Makli Necropolis, the Indus Delta mangroves, and the cosmopolitan port city of Karachi, Pakistan's economic and cultural capital.",
    'Balochistan': "Pakistan's largest and most remote province rewards those who venture off the beaten track. The otherworldly Hingol National Park, the ancient city of Quetta, the turquoise waters of the Ormara coast, and the dramatic Makran Coastal Highway rank among Pakistan's most spectacular and least-visited attractions.",
    'Azad Kashmir': "A paradise in green. Azad Kashmir's attractions centre on the magnificent Neelum Valley, where glacial rivers carve through pine-forested mountains. Ratti Gali Lake, Taobat, Sharda, and dozens of trout-filled streams make this one of Pakistan's most beautiful and increasingly popular destinations.",
    'Islamabad Capital Territory': "Pakistan's modern capital combines planned urban elegance with natural escapes. The Margalla Hills National Park offers hiking trails with views of the city skyline, while the Faisal Mosque — one of the world's largest — stands as a symbol of modern Pakistani architecture and Islamic heritage.",
  };

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (searchParams.search) params.set('search', searchParams.search);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return `/attractions${qs ? `?${qs}` : ''}`;
  }

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
          <p className="text-gray-400 max-w-2xl text-lg leading-relaxed mb-3">
            Pakistan's most spectacular sights — from ancient forts to soaring peaks and sacred shrines. With over 5,000 years of continuous civilisation, seven UNESCO World Heritage Sites, and some of the world's most dramatic natural landscapes, Pakistan offers an unmatched variety of attractions for every type of traveller.
          </p>
          <p className="text-gray-500 max-w-2xl text-base leading-relaxed mb-10">
            Explore our complete directory of {stats.total}+ verified attractions across {stats.uniqueProvinces} provinces of Pakistan — from the glacier highways of Gilgit-Baltistan to the Mughal monuments of Punjab and the ancient ruins of Sindh.
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
            {[
              { label: 'Attractions', value: `${stats.total}+` },
              { label: 'Provinces Covered', value: `${stats.uniqueProvinces}` },
              { label: 'Categories', value: `${stats.categories}+` },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {attractions.length === 0 ? (
          <div className="text-center py-24">
            <Compass size={56} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No attractions found</p>
          </div>
        ) : (
          <div className="space-y-14">

            {/* Intro text block — shown only on page 1 */}
            {page === 1 && (
              <section className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Why Pakistan's Attractions Are Unmissable</h2>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  Pakistan is one of the world's most dramatically varied countries. In a single journey, you can stand beneath the towering face of K2 — the world's second highest peak — and within days be walking through the UNESCO-listed Lahore Fort, a monument to the most powerful empire in South Asian history. This extraordinary range of natural and cultural attractions is what makes Pakistan such a compelling destination for adventurous travellers.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  The country's northern regions — particularly Gilgit-Baltistan and Khyber Pakhtunkhwa — are home to an unparalleled concentration of high-altitude natural wonders. Glaciers, mountain lakes, ancient caravan trails, and towering peaks create landscapes that rival anything in the Alps or Himalayas. Meanwhile, the southern provinces of Punjab, Sindh, and Balochistan hold the archaeological and architectural legacy of some of humanity's oldest and most sophisticated civilisations, including Mohenjo-daro, Taxila, and the Indus Valley sites.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  Whether you're a heritage enthusiast, a nature lover, a photographer, or an adrenaline seeker, you'll find that Pakistan's attractions consistently exceed expectations. PAKTourism curates and verifies every listing on this page, providing accurate entry fee information, operating hours, and local context to help you plan with confidence.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  Pakistan holds seven UNESCO World Heritage Sites — the Lahore Fort and Shalamar Gardens, the archaeological ruins of Mohenjo-daro, the Buddhist ruins of Takht-i-Bahi, the fort and Shalamar Gardens of Lahore, the historical monuments of Makli, the Rohtas Fort, and the ancient trading post of Taxila. Each of these sites represents a pinnacle of human achievement in its era and is freely accessible to international visitors with minimal ticketing requirements.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  The adventure tourism credentials of Pakistan are equally remarkable. The Karakoram Highway — often called the Eighth Wonder of the World — connects the country to Central Asia through some of the highest mountain passes on earth. Along its route lie the Hunza Valley, the Attabad Lake, the Khunjerab Pass, and access points to Rakaposhi and dozens of other peaks above 7,000 metres. For trekkers, climbers, and overland adventurers, this single corridor offers a lifetime of exploration.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  Cultural attractions are equally rich. Pakistan's religious heritage is extraordinarily diverse: ancient Hindu temples in Katas Raj, Sikh pilgrimage sites including Gurdwara Darbar Sahib Kartarpur, Buddhist stupas across Gandhara, centuries-old Sufi shrines from Lahore to Sindh, and grand mosques built across every province. Visitors of every background find Pakistan's spiritual and cultural landscape to be a revelation, far exceeding the impressions formed by media coverage of the country.
                </p>
              </section>
            )}

            {/* Results header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-bold text-gray-900 dark:text-white">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</span> of <span className="font-bold text-gray-900 dark:text-white">{total}</span> attractions
              </p>
              {totalPages > 1 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
              )}
            </div>

            {/* Province-grouped grid */}
            {attractionsByProvince.map(({ province, items }) => (
              <section
                key={province}
                id={`province-${province.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="space-y-5 scroll-mt-28"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-1">Province</p>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{province}</h2>
                  {provinceDescriptions[province] && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-3xl mt-2">
                      {provinceDescriptions[province]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((attr) => {
                    const gallery = parseJson<string[]>(attr.gallery, []);
                    return (
                      <Link key={attr.id} href={`/attractions/${attr.id}`} className="group block">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm card-hover h-full flex flex-col">
                          <div className="relative h-48 overflow-hidden shrink-0">
                            <SafeImage
                              src={gallery[0] || DEFAULT_TOURISM_IMAGE}
                              alt={attr.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            {attr.taxonomy && (
                              <div className="absolute top-3 left-3 bg-primary-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {attr.taxonomy.name}
                              </div>
                            )}
                          </div>
                          <div className="p-5 flex flex-col flex-grow">
                            <p className="text-[11px] font-semibold text-primary-500 flex items-center gap-1 mb-1">
                              <MapPin size={10} /> {attr.destination.title}
                            </p>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors leading-snug">
                              {attr.title}
                            </h3>
                            {attr.description && (
                              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-3 mb-3 flex-grow">
                                {attr.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto text-[11px] text-gray-400">
                              <span className="flex items-center gap-1">
                                <Ticket size={11} className="text-primary-500" />
                                {attr.entryFee || 'Free Entry'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={11} className="text-primary-500" />
                                {attr.timings ? attr.timings.slice(0, 18) : '9 AM – 5 PM'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-2 pt-6" aria-label="Pagination">
                {page > 1 && (
                  <Link
                    href={pageUrl(page - 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft size={15} /> Previous
                  </Link>
                )}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                    return (
                      <Link
                        key={p}
                        href={pageUrl(p)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${p === page ? 'bg-primary-600 text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>
                {page < totalPages && (
                  <Link
                    href={pageUrl(page + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Next <ChevronRightIcon size={15} />
                  </Link>
                )}
              </nav>
            )}

          </div>
        )}
      </div>

      {/* FAQ section — shown only on page 1 */}
      {page === 1 && (
        <section className="bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-3">Know Before You Go</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-10">Frequently Asked Questions About Pakistan's Attractions</h2>
            <div className="space-y-8">
              {([
                {
                  q: 'Is Pakistan safe for tourists visiting its attractions?',
                  a: 'Yes — Pakistan has seen a dramatic improvement in security and tourism infrastructure over the past decade. The vast majority of tourist attractions, including Gilgit-Baltistan, Azad Kashmir, Lahore, and Swat Valley, are considered safe for domestic and international visitors. Pakistan Tourism Development Corporation (PTDC) and provincial tourism authorities maintain regular safety advisories, and hundreds of thousands of foreign tourists visit each year without incident. As with any destination, travellers should check current advisories from their home country\'s foreign ministry before visiting remote border areas.',
                },
                {
                  q: 'Do I need a visa to visit Pakistan and its attractions?',
                  a: 'Pakistan now offers visa-on-arrival and e-visa facilities to citizens of over 100 countries, making it significantly easier to visit than in previous years. Citizens of many Western, Gulf, and Asian countries can obtain an e-visa online within days. Visitors to certain sensitive areas — particularly near the Chinese, Afghan, or Indian borders — may require additional permits beyond the standard visa. PAKTourism recommends verifying your specific requirements via the National Database and Registration Authority (NADRA) e-visa portal before travel.',
                },
                {
                  q: 'What is the best time of year to visit Pakistan\'s attractions?',
                  a: 'The ideal time varies significantly by region. For northern attractions in Gilgit-Baltistan and KPK — including K2 base camp, Hunza Valley, and Swat — the best window is May to September when mountain passes are open and weather is clear. For cultural attractions in Lahore, Multan, and Punjab, October to March offers comfortable temperatures. Sindh and Balochistan are best visited from November to February, when the desert and coastal heat is manageable. Azad Kashmir is beautiful from April to October.',
                },
                {
                  q: 'How do I get around to visit different attractions?',
                  a: 'Pakistan has a growing network of transport options. Domestic flights connect Islamabad, Lahore, Karachi, Peshawar, Quetta, Skardu, and Gilgit. For overland travel, NATCO buses operate on the Karakoram Highway, and private coaches connect major cities. Within cities, ride-hailing apps like Careem and InDrive are widely available. In remote mountain areas, hiring a local driver with a 4WD vehicle is the most practical option — PAKTourism can connect you with verified local transport providers.',
                },
                {
                  q: 'Are Pakistan\'s attractions expensive to visit?',
                  a: 'Pakistan is consistently rated as one of the most affordable travel destinations in Asia. Entry fees to most attractions are nominal — typically PKR 100-500 (under USD 2) for government-managed sites, and many natural attractions are completely free. Accommodation, food, and transport are also significantly cheaper than comparable destinations in India, Turkey, or Southeast Asia. A comfortable mid-range travel budget for Pakistan would be USD 40-70 per day including accommodation, meals, transport, and attraction fees.',
                },
                {
                  q: 'Can I visit Pakistan\'s attractions independently or do I need a guide?',
                  a: 'Most of Pakistan\'s major cultural and urban attractions — Lahore Fort, Badshahi Mosque, Mohenjo-daro, Taxila Museum — can be visited completely independently with a transport connection. However, for trekking routes above base camp level, remote archaeological sites in Balochistan, and certain restricted zones near borders, a licensed guide is either required by regulation or strongly recommended for safety. PAKTourism\'s guide directory lists certified professionals for every major trekking and heritage route in the country.',
                },
                {
                  q: 'What should I pack for visiting Pakistan\'s diverse attractions?',
                  a: 'Packing depends heavily on which regions you\'re visiting. For northern mountain attractions, layering is essential year-round — temperatures at altitude can drop below freezing even in summer. For cultural sites and cities, modest clothing covering shoulders and knees is respectful and expected. Good walking shoes are essential everywhere. Sun protection (SPF 50+, sunglasses, hat) is critical for glacier walks and high-altitude trekking. A basic first aid kit, water purification tablets, and a portable battery bank round out the essentials for remote areas.',
                },
                {
                  q: 'Which attractions in Pakistan are suitable for families with children?',
                  a: 'Pakistan has excellent family-friendly attractions. Lahore Zoo, Lahore Fort with its children\'s guided tours, the Lok Virsa Museum in Islamabad, Katas Raj Temples, the Shalimar Gardens, and the planetarium at the Science Museum in Karachi are all popular family destinations. For nature-based family experiences, the Ayubia National Park in KPK, the Rawal Lake Complex in Islamabad, and the beaches of the Makran Coast in Balochistan offer age-appropriate adventures. Most family-oriented sites have basic facilities including washrooms and food stalls.',
                },
                {
                  q: 'Are there photography restrictions at Pakistan\'s attractions?',
                  a: 'Photography is permitted at the vast majority of Pakistan\'s attractions and is actively encouraged as a way to showcase the country\'s beauty to the world. A small number of military installations and sensitive government buildings prohibit photography, and these are clearly signed. At religious sites — mosques, shrines, and temples — photography of interiors is often allowed but visitors should check with staff and always ask permission before photographing worshippers. In rural communities, asking before photographing people is both courteous and culturally important.',
                },
                {
                  q: 'How does PAKTourism verify the attractions listed on this page?',
                  a: 'Every attraction in the PAKTourism directory has been researched and verified by our team of local tourism experts and field correspondents across all provinces. We cross-reference entry fees and opening hours with official provincial tourism authority data and update listings regularly. User-submitted reviews and corrections are reviewed by our moderation team before being published. Our goal is to be the most accurate and comprehensive English-language resource for Pakistan\'s tourism attractions, updated to reflect real conditions on the ground rather than outdated guidebook entries.',
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
      )}

      {/* Bottom SEO section — shown only on page 1 */}
      {page === 1 && (
        <section className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Planning Your Visit to Pakistan's Attractions</h2>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  Pakistan's attractions span an enormous range of categories — archaeological sites, natural wonders, forts and palaces, religious landmarks, wildlife reserves, and adventure hotspots. Many of the country's most celebrated sites are in remote areas that require some planning: checking road conditions, booking accommodation in advance during peak season (May to September in the north), and securing appropriate permits for restricted zones near the Line of Control or international borders.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  Entry fees at government-managed attractions are generally very affordable by international standards, and most natural sites remain free of charge. However, hiring a local guide is strongly recommended not only for safety in mountain terrain but also for the depth of cultural and historical context they provide. PAKTourism connects you with verified, professionally trained guides across all major provinces.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  Photography is widely welcomed across Pakistan's attractions, and locals are generally friendly and enthusiastic about having visitors explore and document their regions. Always ask permission before photographing people, particularly in religious sites and rural communities. Responsible, respectful tourism directly benefits local economies and encourages the preservation of Pakistan's irreplaceable natural and cultural heritage.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Quick Tips for Visitors</h3>
                <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                  {[
                    'Arrive at popular sites early morning to beat crowds and midday heat.',
                    "Carry cash — many remote attractions and local vendors don't accept cards.",
                    'Download offline maps before heading to areas with limited mobile coverage.',
                    'Dress modestly — shoulders and knees covered is appropriate across Pakistan.',
                    'Acclimatise gradually before visiting high-altitude attractions above 3,000m.',
                    'Book a local guide through PAKTourism for mountain treks and border-region sites.',
                    'Check seasonal road closures — many northern passes close from November to April.',
                    'Pakistan Standard Time (PST) is UTC+5; plan travel connections accordingly.',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
