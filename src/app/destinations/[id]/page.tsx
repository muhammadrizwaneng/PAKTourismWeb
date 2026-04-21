import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import {
  MapPin, Clock, Ticket, ArrowRight, Star, ArrowLeft,
  Hotel as HotelIcon, Calendar, Users, ChevronRight,
} from 'lucide-react';
import { HospitalsSection } from '@/components/HospitalsSection';
import { PetrolPumpsSection } from '@/components/PetrolPumpsSection';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';
import WeatherWidget from '@/components/WeatherWidget';
import ShareButtons from '@/components/ShareButtons';
import FavoriteButton from '@/components/FavoriteButton';
import { parseJson } from '@/lib/utils';
import JsonLd from '@/components/JsonLd';

interface DestinationVideoRecord {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  attractionTitle: string | null;
}

async function getDestination(id: string) {
  const destination = await prisma.destination.findUnique({
    where: { id: parseInt(id) },
    include: {
      taxonomy: true,
      attractions: true,
      hotels:true,
      packages: true,
      pointsOfInterest: true,
      reviews: { orderBy: { createdAt: 'desc' }, take: 5 },
      _count: { select: { attractions: true, hotels: true, packages: true, reviews: true } },
    },
  });
  if (!destination) return null;
  return destination;
}

export default async function DestinationDetailPage({ params }: { params: { id: string } }) {
  const destination = await getDestination(params.id);
  if (!destination) notFound();

  const galleryImages = parseJson<string[]>(destination.galleryImages, []);
  const galleryVideos = parseJson<DestinationVideoRecord[]>(destination.galleryVideos, []);

  type POI = (typeof destination.pointsOfInterest)[number];
  const hospitals = destination.pointsOfInterest.filter(
    (p: POI) => p.category === 'Hospital'
  );
  const petrolPumps = destination.pointsOfInterest.filter(
    (p: POI) => p.category?.toLowerCase() === 'fuel' || p.category?.toLowerCase().includes('petrol')
  );

  const cityName = destination.city || destination.title;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paktourism.pk';

  const destinationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: destination.title,
    description: destination.description || undefined,
    url: `${SITE_URL}/destinations/${destination.id}`,
    image: destination.featuredImage || undefined,
    touristType: [{ '@type': 'Audience', audienceType: 'Tourists' }],
    ...(destination.latitude && destination.longitude ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
    } : {}),
    containsPlace: destination.attractions.map((a: (typeof destination.attractions)[number]) => ({
      '@type': 'TouristAttraction',
      name: a.title,
      url: `${SITE_URL}/attractions/${a.id}`,
    })),
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <JsonLd data={destinationSchema} />

      {/* ══════════════════ HERO ══════════════════ */}
      <div className="relative h-[85vh] min-h-[560px] w-full overflow-hidden">
        <SafeImage
          src={destination.featuredImage || DEFAULT_TOURISM_IMAGE}
          alt={destination.title}
          fill
          className="object-cover"
          priority
        />
        {/* Layered gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20" />
        {/* Top nav area fade */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Back button */}
        <div className="absolute top-24 left-0 w-full px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <ArrowLeft size={15} /> All Destinations
            </Link>
          </div>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-8 pb-10 md:pb-14">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/60 text-xs font-medium mb-4">
              <span>{destination.province}</span>
              <ChevronRight size={12} />
              <span className="text-primary-400">{cityName}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white leading-none tracking-tighter mb-6">
              {destination.title}
            </h1>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-5 py-2.5 rounded-full text-white">
                <Calendar size={14} className="text-primary-400" />
                <span className="text-xs font-semibold">Best: {destination.bestTime || 'Year Round'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-5 py-2.5 rounded-full text-white">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold">4.9 · {destination._count.reviews} reviews</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-5 py-2.5 rounded-full text-white">
                <MapPin size={14} className="text-primary-400" />
                <span className="text-xs font-semibold">{destination._count.attractions} Attractions</span>
              </div>
              {destination._count.hotels > 0 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-5 py-2.5 rounded-full text-white">
                  <HotelIcon size={14} className="text-primary-400" />
                  <span className="text-xs font-semibold">{destination._count.hotels} Hotels</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-6">
              <FavoriteButton
                item={{
                  id: destination.id,
                  type: 'destination',
                  title: destination.title,
                  image: destination.featuredImage || undefined,
                  subtitle: `${destination.city}, ${destination.province}`,
                }}
              />
              <ShareButtons title={destination.title} />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════ BODY ══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 xl:gap-16">

          {/* ── MAIN COLUMN ── */}
          <div className="lg:col-span-2 space-y-16">

            {/* About */}
            <section>
              <p className="section-label mb-2">Overview</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-5 tracking-tight">
                About {destination.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base whitespace-pre-wrap mb-5">
                {destination.description}
              </p>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base mb-5">
                Located in {destination.province}, {destination.title} is one of Pakistan's most memorable destinations, attracting visitors from across the country and around the world. The area offers a unique combination of natural scenery, historical significance, and cultural depth that rewards exploration at every level — whether you spend a single day here or dedicate an entire week to discovering its hidden corners.
              </p>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base">
                With {destination._count.attractions} listed attractions and {destination._count.hotels} verified hotels, {destination.title} has the infrastructure to support both independent travellers and organised tour groups. The best time to visit is {destination.bestTime || 'year round'}, though the destination has something to offer in every season. Local guides, available through PAKTourism, can enrich any visit with the kind of contextual knowledge that turns sightseeing into a genuine cultural exchange.
              </p>
            </section>

            {/* Travel guide */}
            <section className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-7 md:p-10 border border-gray-100 dark:border-gray-800 space-y-5">
              <p className="section-label mb-1">Visitor Guide</p>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Travelling to {destination.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Getting to {destination.title} in {destination.province} is straightforward by road from Pakistan's major urban centres. The Motorway and National Highway network connects most provincial capitals to this region, and domestic flight connections are available to the nearest city airport. Once you arrive, local transport options include taxis, ride-hailing apps (in urban areas), and hired local minibus services for group travel between sites.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Accommodation in {destination.title} ranges from budget guesthouses to mid-range business hotels and, in some cases, luxury properties with modern amenities. Booking in advance is recommended during peak season — particularly if you are travelling during Eid holidays, the summer school break in July and August, or the October–November photography season when the region attracts large numbers of photographers and nature enthusiasts.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Local food in {destination.province} is a highlight of any trip to {destination.title}. The regional cuisine reflects the province's agricultural heritage and cultural influences, with fresh ingredients, slow-cooked dishes, and bread-based staples that vary notably from what you would find in other parts of Pakistan. Asking your guide or hotel staff for recommendations on where locals eat will invariably lead you to the most authentic and affordable meals.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Safety in {destination.title} is generally excellent for both domestic and international visitors. As with any destination, standard travel precautions apply: keep valuables secure, stay aware of your surroundings in busy markets, and check current road and weather conditions before departing for remote or mountainous areas if the destination is in a northern province. PAKTourism's emergency contacts section on this page lists the nearest hospitals and essential services.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Currency and payments in {destination.title} follow the national norm: the Pakistani Rupee (PKR) is the only accepted currency, and while card payment infrastructure is improving in major cities, cash remains essential in markets, small restaurants, and for transport. ATMs from HBL, UBL, Meezan Bank, and Allied Bank are widely available in central areas. Currency exchange counters operate at airports and in central bazaars. International visitors should check their bank's foreign transaction fees before departure, as charges vary considerably between providers.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Mobile connectivity in {destination.title} is generally good for Jazz, Telenor, and Zong subscribers within the main urban area. If you are travelling on an international SIM, consider purchasing a local prepaid SIM at the airport or at any registered network outlet in the city — the cost is minimal and the coverage gain is substantial. For travellers moving between {destination.title} and remote areas of {destination.province}, downloading offline maps via Google Maps or Maps.me before departing urban coverage zones is strongly recommended.
              </p>
            </section>
            {(destination.attractions.length > 0 || hospitals.length > 0 || petrolPumps.length > 0) && (
              <section>
                <p className="section-label mb-2">Explore</p>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">
                  Must-Visit Attractions
                </h2>
                {/* Grid cards */}
                {destination.attractions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    {destination.attractions.map((attr: (typeof destination.attractions)[number]) => {
                      const attrImg = attr.gallery
                        ? JSON.parse(attr.gallery)[0] || DEFAULT_TOURISM_IMAGE
                        : DEFAULT_TOURISM_IMAGE;
                      return (
                        <Link
                          key={attr.id}
                          href={`/attractions/${attr.id}`}
                          className="group block"
                        >
                          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden card-hover">
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden">
                              <SafeImage
                                src={attrImg}
                                alt={attr.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              {/* Badges */}
                              <div className="absolute bottom-3 left-3 flex gap-2">
                                {attr.entryFee && (
                                  <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                    <Ticket size={9} /> {attr.entryFee}
                                  </span>
                                )}
                                {attr.timings && (
                                  <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                    <Clock size={9} /> {attr.timings}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Body */}
                            <div className="p-4">
                              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors mb-1 line-clamp-1">
                                {attr.title}
                              </h3>
                              <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed">
                                {attr.description}
                              </p>
                              <div className="flex items-center gap-1 text-primary-600 font-bold text-xs mt-3 group-hover:gap-2 transition-all">
                                View Details <ArrowRight size={12} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Hospitals */}
                <HospitalsSection hospitals={hospitals} cityName={cityName} destinationId={destination.id} />

                {/* Petrol Pumps */}
                <PetrolPumpsSection pumps={petrolPumps} cityName={cityName} destinationId={destination.id} />
              </section>
            )}
            {/* Gallery */}
            {galleryImages.length > 0 && (
              <section>
                <p className="section-label mb-2">Gallery</p>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                  Photo Highlights
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {galleryImages.map((img: string, i: number) => (
                    <div
                      key={i}
                      className={`relative rounded-2xl overflow-hidden ${i === 0 ? 'col-span-2 h-[360px]' : 'h-52'}`}
                    >
                      <SafeImage
                        src={img}
                        alt={`${destination.title} ${i + 1}`}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {galleryVideos.length > 0 && (
              <section>
                <p className="section-label mb-2">Videos</p>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                  Watch {destination.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {galleryVideos.map((video) => (
                    <div
                      key={video.id}
                      className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
                    >
                      <div className="relative aspect-video bg-black">
                        <video
                          controls
                          preload="metadata"
                          poster={video.thumbnailUrl || undefined}
                          className="w-full h-full object-cover"
                        >
                          <source src={video.videoUrl} />
                        </video>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                          {video.title}
                        </h3>
                        {video.attractionTitle && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Related attraction: {video.attractionTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {/* ── Attractions ── */}

            {/* History & Culture */}
            <section className="space-y-5">
              <p className="section-label mb-1">History &amp; Culture</p>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                The Heritage of {destination.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                {destination.province} is one of Pakistan's most historically layered regions, and {destination.title} sits at the heart of its cultural narrative. The area has been shaped by successive waves of civilisation — from the ancient Indus Valley settlements and the Gandharan Buddhist culture through to the Mughal Empire, the Sikh Kingdom, British colonial rule, and the modern state of Pakistan. Each era has left visible traces in the architecture, religious life, language, and social customs that define {destination.title} today.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                The cultural fabric of {destination.title} is woven from a remarkable diversity of influences. The poetry of the Sufi saints, the martial traditions of the Mughal armies, the administrative legacy of British town planning, and the entrepreneurial energy of contemporary Pakistani urban life all coexist here in ways that feel organic rather than contradictory. Visitors who approach {destination.title} with curiosity rather than a checklist invariably leave with a far more nuanced understanding of South Asian civilisation than they arrived with.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Music, cuisine, and handicrafts are central to the cultural identity of {destination.province}. The region has its own distinct musical traditions, seasonal festivals, and craft industries that continue to thrive alongside modern commercial culture. Whether you visit a local bazaar to watch artisans at work, attend a weekly Sufi devotional gathering, or simply sit in a traditional tea house and watch the city move around you, {destination.title} offers constant reminders that culture here is not a performance staged for tourists — it is daily life, open to anyone willing to engage with it respectfully.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                The culinary heritage of {destination.title} deserves its own mention. {destination.province}'s food culture is one of the richest and most distinct in Pakistan — with specific dishes, spice profiles, and cooking methods that are rarely replicated faithfully outside the region. Street food in particular is an essential part of the {destination.title} experience: the combination of affordable prices, extraordinary flavour, and the theatre of watching skilled cooks prepare food in open-air stalls makes eating your way around the city one of the most memorable aspects of any visit.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Religious life in {destination.title} is visible and vibrant without being intrusive to visitors of any background. Mosques, shrines, and religious schools are woven into the urban fabric, and the daily call to prayer marks the rhythm of the city throughout the day. The Sufi tradition is particularly strong in {destination.province}, and visitors are generally welcome to observe the devotional ceremonies held at shrines on Thursday evenings — an experience that offers one of the most direct and affecting windows into Pakistani spiritual culture available to any traveller.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                Language and communication in {destination.title} are rarely a barrier for English-speaking visitors. Urdu is widely spoken and understood, and English is used in hotels, restaurants, and shops catering to visitors. In {destination.province}, knowledge of a few words of the regional language — whether Punjabi, Pashto, Sindhi, or Shina depending on where you are — is warmly appreciated by locals and invariably generates goodwill and conversation. Even a simple greeting in the local language communicates respect for the community you are visiting and opens doors that remain firmly closed to those who do not make the effort.
              </p>
            </section>

            {/* Tips for visiting */}
            <section className="space-y-5">
              <p className="section-label mb-1">Tips</p>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Tips for Visiting {destination.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {([
                  ['Plan for the best season', `The ideal time to visit ${destination.title} is ${destination.bestTime || 'year round'}. Arriving outside peak season often means quieter sites and lower accommodation rates, but check whether any key attractions have seasonal closures before booking.`],
                  ['Book accommodation early', `Hotels in ${destination.title} fill up fast during public holidays, Eid weekends, and summer school holidays. Reserve at least 2–3 weeks in advance for mid-range properties, and 1–2 months ahead if you want the best-rated hotels during peak season.`],
                  ['Carry cash', `While major hotels and restaurants in ${destination.title} accept bank cards, many local shops, street food vendors, and smaller guesthouses prefer Pakistani Rupees (PKR). ATMs are available in the main city area but may be unreliable in more remote parts of the region.`],
                  ['Respect local customs', `${destination.province} has a rich cultural heritage and strong community values. Dress modestly when visiting religious sites — covering shoulders and knees is appropriate for both men and women. Always ask permission before photographing people, particularly in rural and traditional community settings.`],
                  ['Hire a local guide', `A certified local guide from ${destination.title} or ${destination.province} brings the destination to life in a way no map or app can replicate. From knowing which site to visit first for the best light to sharing oral histories passed down for generations, a guide turns a good trip into an exceptional one.`],
                  ['Check road & weather conditions', `If you are travelling to remote areas or mountain sites near ${destination.title}, always check current road conditions before departing. In ${destination.province}, some roads may be impassable after heavy rain or seasonal snow. Your hotel or PAKTourism guide can advise on current conditions.`],
                ] as [string, string][]).map(([title, body]) => (
                  <div key={title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="space-y-5">
              <p className="section-label mb-1">FAQ</p>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Frequently Asked Questions About {destination.title}
              </h2>
              <div className="space-y-6">
                {([
                  {
                    q: `Is ${destination.title} safe for tourists?`,
                    a: `Yes — ${destination.title} in ${destination.province} is considered safe for both domestic and international tourists. The local community is welcoming to visitors, and the area has a well-established tourism infrastructure. As with any travel destination, standard precautions such as keeping valuables secure and staying informed about current local conditions are recommended. PAKTourism advises all visitors to register an emergency contact and share their itinerary with someone before venturing into remote areas.`,
                  },
                  {
                    q: `What is the best way to get around ${destination.title}?`,
                    a: `Within ${destination.title}, the most practical transport options are local taxis, ride-hailing apps (available in larger urban centres), and rented vehicles for multi-site day trips. For travellers exploring multiple sites across ${destination.province}, hiring a driver for the day is a cost-effective and comfortable option. Many PAKTourism guide profiles include transport services — booking a guide with a vehicle simplifies logistics considerably.`,
                  },
                  {
                    q: `How many days should I spend in ${destination.title}?`,
                    a: `Most visitors to ${destination.title} find that two to three days allows a comfortable exploration of the main attractions, with time for at least one longer excursion to a nearby site. If you plan to hike, explore surrounding villages, or visit multiple historical sites in depth, extending your stay to four or five days is worthwhile. PAKTourism's package listings for ${destination.title} offer pre-planned itineraries across various durations.`,
                  },
                  {
                    q: `What should I pack for a trip to ${destination.title}?`,
                    a: `Packing depends on the season. For the ${destination.bestTime || 'recommended travel period'}, comfortable walking shoes, layers for temperature variation, a sun hat, high-SPF sunscreen, and a refillable water bottle are essentials. If you are visiting mountainous or high-altitude attractions near ${destination.title}, add thermal layers, waterproof outerwear, and a first-aid kit. A offline maps app with the ${destination.province} region downloaded is also recommended before you lose city connectivity.`,
                  },
                ] as { q: string; a: string }[]).map(({ q, a }, i) => (
                  <div key={i} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{q}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ── SIDEBAR ── */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">

            {/* Quick book CTA */}
            <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-500 rounded-3xl p-6 text-white overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <p className="text-primary-100 text-xs font-bold tracking-widest uppercase mb-1">Plan your trip</p>
              <h3 className="text-xl font-black mb-4">{destination.title} Tour Packages</h3>

              <div className="space-y-3 mb-6">
                {destination.packages.length > 0 ? destination.packages.map((pkg: (typeof destination.packages)[number]) => (
                  <Link key={pkg.id} href={`/packages/${pkg.id}`} className="group block">
                    <div className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-3.5 transition-all">
                      <h4 className="font-bold text-sm mb-1 line-clamp-1 group-hover:text-primary-200 transition-colors">
                        {pkg.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-primary-200">
                          <Calendar size={10} /> {pkg.durationDays} Days
                        </span>
                        <span className="font-black text-white">PKR {pkg.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p className="text-primary-200 text-sm italic">No packages yet for this destination.</p>
                )}
              </div>

              <Link
                href="/packages"
                className="flex items-center justify-center gap-2 w-full bg-white text-primary-700 font-bold py-3 rounded-2xl hover:bg-primary-50 active:scale-95 transition-all text-sm shadow-lg"
              >
                Explore All Packages <ArrowRight size={14} />
              </Link>
            </div>

            {/* Hotels */}
            {destination.hotels.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <HotelIcon size={18} className="text-primary-600" /> Best Places to Stay
                  </h3>
                  <Link href="/hotels" className="text-xs text-primary-600 font-bold hover:underline">
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {destination.hotels.map((hotel: (typeof destination.hotels)[number]) => {
                    const hotelImg = hotel.gallery
                      ? JSON.parse(hotel.gallery)[0] || DEFAULT_TOURISM_IMAGE
                      : DEFAULT_TOURISM_IMAGE;
                    return (
                      <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="group block">
                        <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all bg-white dark:bg-gray-900">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                            <SafeImage
                              src={hotelImg}
                              alt={hotel.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                              {hotel.title}
                            </h4>
                            <div className="flex text-yellow-400 mb-1">
                              {[...Array(hotel.starRating || 3)].map((_, i) => (
                                <Star key={i} size={10} fill="currentColor" />
                              ))}
                            </div>
                            <p className="text-primary-600 font-bold text-xs">
                              {hotel.priceRange || 'Check availability'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick facts */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="font-black text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-widest">Quick Facts</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-medium flex items-center gap-2"><MapPin size={13} /> Province</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{destination.province}</span>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-medium flex items-center gap-2"><Calendar size={13} /> Best Time</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{destination.bestTime || 'Year Round'}</span>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-medium flex items-center gap-2"><Users size={13} /> Attractions</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{destination._count.attractions}</span>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-medium flex items-center gap-2"><HotelIcon size={13} /> Hotels</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{destination._count.hotels}</span>
                </li>
              </ul>
            </div>

            {/* Weather Widget */}
            <WeatherWidget city={cityName} />

          </aside>
        </div>
      </div>
    </div>
  );
}

