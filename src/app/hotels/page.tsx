import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Search, MapPin, Star, Phone, Globe, BedDouble, ArrowRight } from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';

const PAGE_SIZE = 6;

async function getHotels(search?: string, page: number = 1) {
  const where: any = search ? {
    OR: [
      { title: { contains: search } },
      { address: { contains: search } },
    ]
  } : {};
  
  const [hotels, totalCount] = await Promise.all([
    prisma.hotel.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        starRating: true,
        phone: true,
        priceRange: true,
        gallery: true,
        destination: {
          select: {
            title: true,
          },
        },
      },
      orderBy: [{ starRating: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.hotel.count({ where }),
  ]);

  return { hotels, totalCount };
}

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const { hotels, totalCount } = await getHotels(searchParams.search, page);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
          <p className="text-gray-400 max-w-2xl text-lg leading-relaxed mb-3">
            From five-star luxury in the city to cosy mountain lodges and restored heritage havelis — find the perfect stay across Pakistan. Our verified directory covers hotels, guesthouses, and boutique retreats in every province, from Karachi's oceanfront to the glacier valleys of Gilgit-Baltistan.
          </p>
          <p className="text-gray-500 max-w-2xl text-base leading-relaxed mb-10">
            Pakistan's accommodation sector has grown rapidly over the past five years. New luxury properties have opened in Islamabad, Lahore, Hunza, and Skardu, while community-run guesthouses in the north continue to offer some of the most memorable and affordable hospitality in Asia. PAKTourism lists and verifies properties across the full spectrum — so whether you're travelling on a shoestring or in search of a spa retreat, you'll find your ideal base here.
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

      {/* Intro section — page 1 only */}
      {page === 1 && (
        <div className="max-w-7xl mx-auto px-4 pt-14 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-14">
            <div className="lg:col-span-2 space-y-5">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">Choosing Where to Stay</p>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">How to Pick the Right Hotel in Pakistan</h2>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Choosing accommodation in Pakistan requires different considerations depending on which region you're visiting. In major cities like Lahore and Islamabad, location relative to the attractions you plan to visit, access to reliable transport, and quality of Wi-Fi connectivity are the primary factors. In the northern mountains, heating systems, water reliability, altitude, and proximity to trailheads matter far more than a swimming pool.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Star ratings in Pakistan follow the Tourism Development Corporation's official classification system, which assesses properties on safety, facilities, staff training, cleanliness, and food quality. A verified 3-star property in Pakistan invariably meets the standards of a comfortable mid-range stay. Five-star properties in Islamabad, Lahore, and Karachi are internationally managed and typically meet the standards of equivalent-rated hotels in Dubai or London at a fraction of the price.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                For mountain and valley travel, the community-run guesthouses of Hunza, Skardu, Chitral, and the Neelum Valley represent some of the best-value accommodation in Asia. These family-run properties typically include breakfast and dinner, and the hosts' local knowledge of trails, weather patterns, and seasonal conditions is invaluable. PAKTourism verifies contact details, pricing, and facilities at all listed guesthouses annually.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white">What to Look For</h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                {([
                  ['Heating & Hot Water', 'Essential in mountain areas, even in summer. Always confirm with the hotel before booking.'],
                  ['Backup Power', 'Load-shedding affects many areas. A generator or solar backup is important for overnight stays.'],
                  ['Verified Reviews', 'Read recent reviews, not just the overall score. Conditions change seasonally.'],
                  ['Meal Inclusion', 'Many northern guesthouses include all meals. Confirm what is and is not included in the rate.'],
                  ['Cancellation Policy', 'Mountain travel is weather-dependent. Book properties with flexible cancellation where possible.'],
                  ['Location vs Price', 'A cheaper hotel an hour from the trailhead may actually cost more once you factor in transport.'],
                ] as [string, string][]).map(([t, d]) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                    <span><span className="font-semibold text-gray-900 dark:text-white">{t}:</span> {d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-10">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
            Found <span className="text-gray-900 dark:text-white">{totalCount}</span> Accommodations
          </p>
          <div className="h-px bg-gray-100 dark:bg-gray-800 flex-grow mx-8 hidden md:block" />
          <div className="text-xs font-bold text-gray-400">Page {page} of {totalPages || 1}</div>
        </div>

        {hotels.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-950 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
            <BedDouble size={56} className="mx-auto text-gray-300 dark:text-gray-700 mb-6" />
            <p className="text-xl font-black text-gray-900 dark:text-white">No hotels found</p>
            <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">We couldn't find any stays matching your criteria. Try adjusting your search or filters.</p>
            <Link href="/hotels" className="mt-8 inline-block bg-primary-600 text-white px-8 py-3 rounded-full font-bold">
              Browse All Stays
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel: any) => {
                const gallery = hotel.gallery ? JSON.parse(hotel.gallery) : [];
                return (
                  <div key={hotel.id} className="group relative block h-full">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm card-hover h-full flex flex-col">
                      <Link href={`/hotels/${hotel.id}`} className="absolute inset-0 z-0 rounded-3xl" />
                      
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
                        <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 text-yellow-500 shadow-sm">
                          {[...Array(hotel.starRating || 3)].map((_: any, i: number) => (
                            <Star key={i} size={11} fill="currentColor" />
                          ))}
                          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 ml-1">{hotel.starRating}-Star</span>
                        </div>

                        {/* Location */}
                        <div className="absolute bottom-4 left-4 z-10">
                          <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                            <MapPin size={11} className="text-primary-400" />
                            {hotel.destination.title}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-grow relative z-10 pointer-events-none">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                          {hotel.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-grow leading-relaxed">
                          {hotel.description || 'Experience world-class hospitality in the heart of Pakistan. Our properties offer a unique blend of traditional elegance and modern luxury to make your stay truly unforgettable.'}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto pointer-events-auto">
                          <span className="text-primary-600 font-bold text-sm">{hotel.priceRange || 'Contact for price'}</span>
                          <div className="flex items-center gap-3">
                            {hotel.phone && (
                              <a href={`tel:${hotel.phone}`} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 hover:text-primary-600 transition-colors relative z-20">
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
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                {page > 1 && (
                  <a
                    href={`/hotels?page=${page - 1}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
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
                          href={`/hotels?page=${p}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
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
                    href={`/hotels?page=${page + 1}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
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

        {/* FAQ — page 1 only */}
        {page === 1 && (
          <section className="mt-20 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 md:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-3">Common Questions</p>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-10">Frequently Asked Questions About Hotels in Pakistan</h2>
            <div className="space-y-8">
              {([
                {
                  q: 'Are international credit cards accepted at hotels in Pakistan?',
                  a: 'Major international Visa and Mastercard cards are accepted at four- and five-star hotels in Islamabad, Lahore, and Karachi. However, many three-star properties, guesthouses, and mountain lodges operate on a cash-only basis. It is strongly recommended to carry sufficient Pakistani Rupee (PKR) cash when travelling to valley and mountain destinations. ATMs are available in most towns but are unreliable or non-existent in remote trekking areas. Withdraw cash before leaving urban centres.',
                },
                {
                  q: 'Is it safe to book hotels online in Pakistan?',
                  a: 'Booking hotels online through PAKTourism and other established platforms is safe and practical. For city properties, platforms like Booking.com, Agoda, and direct hotel websites are fully functional. For guesthouses in Hunza, Skardu, Swat, and the Neelum Valley, it is often best to book directly via WhatsApp — the property\'s contact is listed on each PAKTourism hotel page. Always confirm your booking 24 hours before arrival, particularly for remote properties where communication can be intermittent.',
                },
                {
                  q: 'What is the typical check-in and check-out time in Pakistani hotels?',
                  a: 'Standard check-in time at Pakistani hotels is 2pm and check-out is noon, following international convention. Many properties — particularly mid-range and budget guesthouses — are flexible on these times, especially for guests arriving on long-distance overnight coaches or early-morning flights from Islamabad to Skardu or Gilgit. Contact the hotel directly if you need an early check-in or late check-out; there is usually no additional charge for a few hours\' flexibility.',
                },
                {
                  q: 'Do Pakistani hotels provide halal food?',
                  a: 'Yes — all food served at hotels and restaurants in Pakistan is halal as the country is majority Muslim and halal standards are the default. Alcohol is not served at any hotel restaurant in Pakistan. Most hotels can accommodate vegetarian and vegan guests with advance notice, and many properties in the northern mountain regions naturally serve a plant-forward, grain-based menu. Guests with severe nut allergies or other dietary requirements should communicate these clearly with the hotel at the time of booking.',
                },
                {
                  q: 'Which cities have the best luxury hotel options in Pakistan?',
                  a: 'Islamabad has the most consistent concentration of internationally managed luxury hotels, including several five-star properties in the Diplomatic Enclave area. Lahore\'s luxury market has grown significantly with new openings in the Gulberg and DHA areas. Karachi has a strong business hotel market, particularly in the Clifton and Korangi corridors. For experiential luxury in natural settings, Hunza (Gilgit-Baltistan) and Nathiagali (KPK) now have boutique luxury lodges that offer world-class service with extraordinary mountain backdrops.',
                },
                {
                  q: 'What should I expect from a guesthouse in northern Pakistan?',
                  a: 'Guesthouses in the northern regions of Pakistan — Hunza, Skardu, Gilgit, Chitral, Swat, and Kaghan — typically offer clean, simple rooms with shared or attached bathrooms, beds with warm blankets, and either a set menu of home-cooked food or a basic kitchen facility. The quality of the food at family-run northern guesthouses is often exceptional — home-baked bread, locally grown apricot jam, fresh trout, and mountain vegetables are common meals. Hot water may be solar-heated, so mornings are the best time for a warm shower. Rates range from PKR 1,500 to 5,000 per room per night depending on the valley and season.',
                },
                {
                  q: 'Is Wi-Fi reliable at Pakistan hotels?',
                  a: 'Wi-Fi quality varies enormously by location. Islamabad and Lahore city hotels typically offer reliable broadband. In mountain valleys, internet connectivity is limited to 3G/4G mobile data from the PTCL, Jazz, or Telenor networks, and even these can be intermittent in the deepest valleys. Skardu and Gilgit towns have reasonable connectivity, but once you move into the Hunza Valley, Chitral, or the Neelum Valley, you should not plan on reliable internet access. This is one of the reasons a northern Pakistan trip is a genuinely restorative digital detox experience.',
                },
              ] as { q: string; a: string }[]).map(({ q, a }, i) => (
                <div key={i} className="border-b border-gray-100 dark:border-gray-800 pb-8 last:border-0">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">{q}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════ THE HOSPITALITY ENCYCLOPEDIA (SEO Overhaul) ══════════ */}
        <section className="mt-40 space-y-32">
          
          {/* Section 1: The Heart of the West */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-primary-600 font-black uppercase tracking-[0.4em] text-xs mb-4 block">Cultural Foundation</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-8 leading-tight">The Heart of Pakistani Hospitality</h2>
              <div className="space-y-6 text-gray-600 dark:text-gray-400 text-base leading-relaxed text-justify">
                <p>
                  Hospitality in Pakistan is not merely a service industry; it is a sacred creed deeply embedded in the nation's DNA. This ancient tradition, known locally as "Mehmaan Nawazi," has its roots in the caravanserais of the Silk Route, where travelers from across the globe found sanctuary, food, and companionship. To a Pakistani, a guest is a "Rehmat" (a blessing), and every hotel, from the grandest five-star resort to the humblest mountain lodge, strives to embody this spirit of selfless welcome.
                </p>
                <p>
                  Our modern accommodation landscape reflects this thousand-year history. Whether you are staying in a historic haveli in the walled city of Lahore or a luxury retreat overlooking the Karakorams, you will encounter a level of personal attentiveness that is rare in the global travel market. The interaction begins not at the front desk, but often with a welcoming cup of Kashmiri tea or a traditional greeting that marks the start of a genuine connection between the traveler and the community.
                </p>
                <p>
                  At PAKTourism, we curate hotels that understand this cultural value. We look beyond the thread count and the infinity pools to find properties that provide a window into the soul of Pakistan. Our listed stays are verified not just for their facilities, but for their commitment to providing a safe, authentic, and warm environment for both domestic and international adventurers seeking to discover the true essence of South Asian warmth.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80" alt="Luxury Interior" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-4 pt-12">
                <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80" alt="Mountain View Lodge" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-primary-600 flex items-center justify-center p-8 text-white text-center">
                   <p className="font-bold text-sm tracking-tight italic">"Where every guest is treated like royalty, reflecting a legacy of a thousand years."</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Diverse Stay Guide */}
          <div className="bg-gray-900 rounded-[3rem] p-10 md:p-20 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&q=80")' }} />
            <div className="relative z-10 max-w-4xl">
              <span className="inline-block bg-primary-500/20 backdrop-blur-md text-primary-400 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-8">Accommodation Types</span>
              <h2 className="text-4xl font-black mb-12">From Colonial Grandeur to Eco-Luxury</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                <div>
                  <h3 className="text-xl font-bold text-primary-400 mb-4">Metropolitan Luxury</h3>
                  <p className="text-gray-400 text-sm leading-relaxed text-justify">
                    In cities like Islamabad, Karachi, and Lahore, the hotel scene is dominated by international standards fused with local aesthetics. These properties are the hubs of business and high-society, featuring expansive ballrooms, world-class spas, and a culinary range that spans from fine-dining French to authentic Mughal. Staying in these skyscrapers offers a panoramic view of Pakistan's rapid modernization.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-400 mb-4">Heritage Havelis</h3>
                  <p className="text-gray-400 text-sm leading-relaxed text-justify">
                    For those seeking a journey back in time, Pakistan's ancient cities offer restored Havelis and historic mansions. Many of these properties have preserved their original frescoes, carved wooden balconies, and central courtyards (Aangan). A stay in a heritage hotel is more than just a room; it's a living museum experience that puts you in the heart of the city's old-world charm.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-400 mb-4">Mountain Retreats</h3>
                  <p className="text-gray-400 text-sm leading-relaxed text-justify">
                    In the northern reaches of Gilgit-Baltistan and Khyber Pakhtunkhwa, the accommodation shifts towards wooden chalets and stone lodges. These retreats are designed to maximize the breathtaking views of peaks like Rakaposhi and Nanga Parbat. Modern eco-luxury tents ("Glamping") are also gaining popularity, offering a five-star night under the stars in remote valleys like Fairy Meadows and Hunza.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-400 mb-4">Roadside Comfort</h3>
                  <p className="text-gray-400 text-sm leading-relaxed text-justify">
                    The development of the Motorway network has seen a rise in high-quality roadside motels and transit hotels. These are essential for the overlanders and road trippers exploring the length of the country. They provide standardized comfort, secure parking, and necessary amenities for travelers moving between the provinces.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: The Ultimate Regional Guide */}
          <div>
            <div className="text-center mb-20">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">Regional Stay Insights</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">Different regions of Pakistan require different approaches to choosing your accommodation. Here is our expert breakdown by province.</p>
            </div>
            
            <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12">
              <div className="break-inside-avoid p-8 rounded-3xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Gilgit-Baltistan: The High Peaks</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-justify">
                  When booking in GB, altitude and insulation are key. Look for properties that offer consistent heating systems, as temperatures can drop below freezing even in the shoulder seasons. Properties in Hunza often offer the best infrastructure, while Skardu features more rugged, adventure-oriented lodges. Pro tip: Always ask for a room with a "peak view" — waking up to the sun hitting a 7,000-meter summit is worth the premium.
                </p>
              </div>
              <div className="break-inside-avoid p-8 rounded-3xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Sindh & Balochistan: Coastal Luxury</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-justify">
                  The southern coast is all about the sea breeze. In Karachi, stay near the Clifton or Defense areas for the best beach access and high-end dining. In Balochistan, the port city of Gwadar is home to new luxury options catering to international business travelers and peace-seeking tourists. Ensure your hotel has stable electricity and water purification, given the arid climate of the south.
                </p>
              </div>
              <div className="break-inside-avoid p-8 rounded-3xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Punjab: The Spiritual & Urban</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-justify">
                  In the plains of Punjab, location is everything. In Lahore, staying near Gulberg provides modern shopping and dining, while the Mall Road area offers colonial-era charm. Multan and Bahawalpur feature several heritage properties near the Sufi shrines and historic forts. Always check for air conditioning quality during the summer months (April–August).
                </p>
              </div>
              <div className="break-inside-avoid p-8 rounded-3xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Khyber Pakhtunkhwa: Valley Living</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-justify">
                  Valleys like Swat, Kaghan, and Naran are the darlings of domestic tourism. In these areas, river-side hotels are the most sought after. In Peshawar, stay in the University Road area for modern comfort, or explore more traditional inns near the historic Qissa Khwani bazaar for an authentic frontier experience. Many hotels here are family-run and offer exceptional local trout and Pashtun BBQ.
                </p>
              </div>
              <div className="break-inside-avoid p-8 rounded-3xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Azad Kashmir: Waterfall Retrears</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed text-justify">
                  The greenest part of the country is famous for its riverside motels and forest rest houses. Properties in the Neelum Valley are often simple yet clean, focusing on the immersive nature experience. Connectivity can be limited, so these are perfect for a true digital detox amidst the cascades and pine forests.
                </p>
              </div>
              <div className="break-inside-avoid p-8 rounded-[2rem] bg-primary-600 text-white flex flex-col items-center justify-center text-center p-12">
                <Star size={40} className="mb-4 text-primary-200" />
                <h3 className="font-bold text-xl mb-4">Verified by PAKTourism</h3>
                <p className="text-sm text-primary-100 leading-relaxed">Every property listed on our platform undergoes a rigorous quality and safety check so you can book with total peace of mind.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
