import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  Search, MapPin, ArrowRight, Star, Calendar,
  Users, Award, HeartHandshake, Compass, Clock, Ticket,
} from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';
import JsonLd from '@/components/JsonLd';
import HeroSlideshow from '@/components/HeroSlideshow';

async function getHomeData() {
  const [featuredDestinations, featuredPackages, allAttractions, heroBanners] = await Promise.all([
    prisma.destination.findMany({
      where: { isFeatured: true },
      take: 6,
      include: { _count: { select: { attractions: true } } },
    }),
    prisma.tourPackage.findMany({
      where: { isFeatured: true },
      take: 3,
      include: { destination: { select: { title: true, province: true } } },
    }),
    prisma.attraction.findMany({
      where: {
        description: { not: '' },
        gallery: { contains: 'cloudinary' },
      },
      include: {
        destination: { select: { title: true, province: true } },
        taxonomy: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }).catch(() => []),
  ]);

  // Pick the 6 richest: most gallery images (longer JSON string = more photos)
  type AttractionItem = (typeof allAttractions)[number];
  const popularAttractions = [...allAttractions]
    .sort((a: AttractionItem, b: AttractionItem) => (b.gallery?.length ?? 0) - (a.gallery?.length ?? 0))
    .slice(0, 6);

  return { featuredDestinations, featuredPackages, popularAttractions, heroBanners };
}

export default async function HomePage() {
  const { featuredDestinations, featuredPackages, popularAttractions, heroBanners } = await getHomeData();

  const stats = [
    { value: '50+', label: 'Destinations', icon: MapPin },
    { value: '200+', label: 'Tour Packages', icon: Compass },
    { value: '5000+', label: 'Happy Travelers', icon: Users },
    { value: '4.9★', label: 'Average Rating', icon: Award },
  ];

  const features = [
    {
      icon: HeartHandshake,
      title: 'Trusted Guides',
      desc: 'Every guide on PAKEZY is personally vetted, background-checked, and holds formal local training. Our guides know the terrain, culture, and hidden gems — ensuring every journey is safe, enriching, and truly authentic.',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      desc: 'Emergencies don\'t wait for office hours. Our round-the-clock customer care team is reachable by phone, WhatsApp, and email at any hour. Whether you need a last-minute itinerary change or urgent assistance on the road, we have you covered.',
    },
    {
      icon: Award,
      title: 'Best Price Guarantee',
      desc: 'We believe great travel shouldn\'t break the bank. If you find a lower price for the same experience anywhere else, we match it — no questions asked. Transparent pricing, zero hidden fees, and honest value on every booking.',
    },
  ];

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paktourism.pk';

  const destinationsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Popular Destinations in Pakistan',
    itemListElement: featuredDestinations.map((dest: (typeof featuredDestinations)[number], i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'TouristDestination',
        name: dest.title,
        url: `${SITE_URL}/destinations/${dest.id}`,
        image: dest.featuredImage || undefined,
        description: dest.description || undefined,
        touristType: [{ '@type': 'Audience', audienceType: 'Tourists' }],
      },
    })),
  };

  const attractionsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Popular Attractions in Pakistan',
    itemListElement: popularAttractions.map((attr, i) => {
      const gallery: string[] = attr.gallery ? JSON.parse(attr.gallery) : [];
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'TouristAttraction',
          name: attr.title,
          url: `${SITE_URL}/attractions/${attr.id}`,
          image: gallery[0] || undefined,
          description: attr.description || undefined,
          ...(attr.entryFee ? { isAccessibleForFree: false } : { isAccessibleForFree: true }),
        },
      };
    }),
  };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-950">
      <JsonLd data={[destinationsSchema, attractionsSchema]} />

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <HeroSlideshow banners={heroBanners}>
        {/* Content anchored to bottom */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-semibold tracking-wide">Pakistan's #1 Travel Platform</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-none tracking-tighter mb-4">
            Discover<br />
            <span className="text-primary-400">Pakistan</span>
            <span className="text-white">.</span>
          </h1>
          <p className="text-white/70 text-lg mb-10 max-w-md">
            From the towering peaks of K2 and the serene valleys of Hunza to the Mughal grandeur of Lahore and the ancient ruins of Mohenjo-daro — Pakistan is a land of breathtaking contrasts. Discover its majestic mountains, vibrant bazaars, desert fortresses, and warm hospitality with Pakistan's most trusted travel platform.
          </p>

          {/* Search Bar */}
          <form
            action="/destinations"
            method="GET"
            className="flex flex-col sm:flex-row gap-3 max-w-2xl"
          >
            <div className="flex-1 flex items-center bg-white dark:bg-gray-900 rounded-2xl px-5 py-4 shadow-2xl gap-3">
              <Search size={20} className="text-gray-400 shrink-0" />
              <input
                name="search"
                type="text"
                placeholder="Search destinations, cities…"
                className="w-full bg-transparent text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none text-base"
              />
            </div>
            <button
              type="submit"
              className="sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-primary-900/30 active:scale-95 transition-all text-base"
            >
              Search
            </button>
          </form>

          {/* Quick links */}
          <div className="flex flex-wrap gap-3 mt-6">
            {['Hunza Valley', 'Lahore', 'Skardu', 'Naran'].map((place) => (
              <Link
                key={place}
                href={`/destinations?search=${place}`}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all"
              >
                {place}
              </Link>
            ))}
          </div>
        </div>
      </HeroSlideshow>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600 mb-3">
                <Icon size={22} />
              </div>
              <span className="text-3xl font-black text-gray-900 dark:text-white">{value}</span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ DESTINATIONS ═══════════════════════ */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4">
          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="section-label mb-2">Top Picks</p>
              <h2 className="section-title">Popular Destinations</h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400 text-base max-w-xl leading-relaxed">
                Pakistan is home to some of the world's most spectacular landscapes — from the Karakoram Highway and gilgit-baltistan glaciers to the lush green hills of Khyber Pakhtunkhwa and the sun-baked plains of Punjab. Each destination offers a unique blend of natural beauty, rich history, and unforgettable culture. Explore our most popular places to visit and start planning your next adventure.
              </p>
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm hover:gap-3 transition-all"
            >
              View All Destinations <ArrowRight size={16} />
            </Link>
          </div>

          {/* Grid: 1 hero left + 2 right on desktop */}
          {featuredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Large hero card */}
              {featuredDestinations[0] && (
                <Link
                  href={`/destinations/${featuredDestinations[0].id}`}
                  className="md:col-span-2 group relative h-[420px] md:h-[520px] rounded-3xl overflow-hidden block card-hover"
                >
                  <SafeImage
                    src={featuredDestinations[0].featuredImage || DEFAULT_TOURISM_IMAGE}
                    alt={featuredDestinations[0].title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  {featuredDestinations[0].isFeatured && (
                    <div className="absolute top-5 left-5">
                      <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Featured</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 p-8">
                    <p className="text-primary-400 text-xs font-bold tracking-widest uppercase flex items-center gap-1 mb-2">
                      <MapPin size={12} /> {featuredDestinations[0].province}
                    </p>
                    <h3 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
                      {featuredDestinations[0].title}
                    </h3>
                    <p className="text-white/70 text-sm line-clamp-2 max-w-md">
                      {featuredDestinations[0].description}
                    </p>
                  </div>
                </Link>
              )}

              {/* Right column — 2 stacked cards */}
              <div className="flex flex-col gap-5">
                {featuredDestinations.slice(1, 3).map((dest: (typeof featuredDestinations)[number]) => (
                  <Link
                    key={dest.id}
                    href={`/destinations/${dest.id}`}
                    className="group relative h-[246px] rounded-3xl overflow-hidden block card-hover flex-1"
                  >
                    <SafeImage
                      src={dest.featuredImage || DEFAULT_TOURISM_IMAGE}
                      alt={dest.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <p className="text-primary-400 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 mb-1">
                        <MapPin size={10} /> {dest.province}
                      </p>
                      <h3 className="text-xl font-black text-white">{dest.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Bottom row: remaining 3 small cards */}
              {featuredDestinations.slice(3, 6).map((dest: (typeof featuredDestinations)[number]) => (
                <Link
                  key={dest.id}
                  href={`/destinations/${dest.id}`}
                  className="group relative h-56 rounded-3xl overflow-hidden block card-hover"
                >
                  <SafeImage
                    src={dest.featuredImage || DEFAULT_TOURISM_IMAGE}
                    alt={dest.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <h3 className="text-lg font-black text-white">{dest.title}</h3>
                    <p className="text-primary-400 text-xs font-bold">{dest.province}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">No featured destinations yet.</div>
          )}
        </div>
      </section>

      {/* ═══════════════════════ POPULAR ATTRACTIONS ═══════════════════════ */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="section-label mb-2">Must Visit</p>
              <h2 className="section-title">Popular Attractions</h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400 text-base max-w-xl leading-relaxed">
                Beyond the landscapes lie thousands of man-made and natural wonders — from the UNESCO-listed Lahore Fort and Badshahi Mosque to the dramatic Deosai Plains, ancient Buddhist stupas, and colourful colonial bazaars. Whether you seek history, adventure, or spiritual heritage, Pakistan's attractions will leave you awestruck.
              </p>
            </div>
            <Link
              href="/attractions"
              className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm hover:gap-3 transition-all"
            >
              View All Attractions <ArrowRight size={16} />
            </Link>
          </div>

          {popularAttractions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularAttractions.map((attr) => {
                const gallery = attr.gallery ? JSON.parse(attr.gallery) : [];
                const image = gallery[0] || DEFAULT_TOURISM_IMAGE;
                return (
                  <Link
                    key={attr.id}
                    href={`/attractions/${attr.id}`}
                    className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 card-hover flex flex-col"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <SafeImage
                        src={image}
                        alt={attr.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {attr.taxonomy?.name && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                            {attr.taxonomy.name}
                          </span>
                        </div>
                      )}
                      {gallery.length > 1 && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1.5 rounded-full">
                            {gallery.length} Photos
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center gap-1 text-gray-400 text-xs font-semibold mb-2">
                        <MapPin size={12} className="text-primary-500" />
                        {attr.destination.title}, {attr.destination.province}
                      </div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors flex-grow line-clamp-2">
                        {attr.title}
                      </h3>
                      {attr.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mb-4">
                          {attr.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Ticket size={12} className="text-primary-500" />
                          <span>{attr.entryFee ? `PKR ${attr.entryFee}` : 'Free Entry'}</span>
                        </div>
                        {attr.timings && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-primary-500" />
                            <span className="truncate max-w-[110px]">{attr.timings}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">No attractions yet.</div>
          )}
        </div>
      </section>

      {/* ═══════════════════════ WHY US ═══════════════════════ */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="section-label mb-2">Why PAKEZY</p>
            <h2 className="section-title">Travel smarter, not harder</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
              Planning a trip to Pakistan should be exciting, not stressful. That's why thousands of travelers choose PAKEZY every year. We take care of every detail — from verified local guides and handpicked accommodations to real-time support — so you can focus entirely on the experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <Icon size={26} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PACKAGES ═══════════════════════ */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="section-label mb-2">Best Offers</p>
              <h2 className="section-title">Featured Tour Packages</h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400 text-base max-w-xl leading-relaxed">
                Our expertly crafted tour packages take the guesswork out of travel. Each package includes guided itineraries, accommodation recommendations, and local insights — giving you the best of Pakistan at unbeatable value. From short weekend escapes to multi-week mountain expeditions, there's a package for every traveler.
              </p>
            </div>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm hover:gap-3 transition-all"
            >
              View All Packages <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPackages.length > 0 ? featuredPackages.map((pkg: (typeof featuredPackages)[number]) => (
              <Link
                key={pkg.id}
                href={`/packages/${pkg.id}`}
                className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 card-hover flex flex-col"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <SafeImage
                    src={pkg.featuredImage || DEFAULT_TOURISM_IMAGE}
                    alt={pkg.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {/* Duration badge */}
                  <div className="absolute top-4 left-4">
                    <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      <Calendar size={11} /> {pkg.durationDays} Days
                    </span>
                  </div>
                  {/* Rating */}
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1 bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      <Star size={10} fill="white" /> 4.8
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-1 text-gray-400 text-xs font-semibold mb-3">
                    <MapPin size={12} className="text-primary-500" />
                    {pkg.destination.title}, {pkg.destination.province}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:text-primary-600 transition-colors flex-grow">
                    {pkg.title}
                  </h3>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">From</span>
                      <p className="text-xl font-black text-primary-600">
                        PKR {pkg.price.toLocaleString()}
                        <span className="text-xs font-medium text-gray-400 ml-1">/ person</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
                      View Details <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-3 text-center py-20 text-gray-400">No featured packages yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ BEST TIME TO VISIT ═══════════════════════ */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="section-label mb-2">Plan Ahead</p>
            <h2 className="section-title">Best Time to Visit Pakistan</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
              Pakistan's diverse geography means every season offers something spectacular. From snow-capped winter peaks to blooming spring valleys, sun-drenched summer meadows, and vivid autumn colours — here's how to pick the perfect time for your trip.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-3xl bg-blue-50 dark:bg-blue-900/20 p-7 border border-blue-100 dark:border-blue-800">
              <div className="text-3xl mb-3">❄️</div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Winter (Nov – Feb)</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                Ideal for visiting the historic cities of Lahore, Multan, and Peshawar. The mild winter weather is perfect for exploring Mughal monuments, ancient bazaars, and the desert forts of Cholistan. Coastal Karachi and Gwadar are warm and sunny, making winter the best season for beach lovers on the Arabian Sea.
              </p>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Top picks: Lahore, Karachi, Cholistan, Peshawar</p>
            </div>
            <div className="rounded-3xl bg-green-50 dark:bg-green-900/20 p-7 border border-green-100 dark:border-green-800">
              <div className="text-3xl mb-3">🌸</div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Spring (Mar – May)</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                Spring is arguably the most beautiful season in Pakistan. Cherry blossom trees transform Hunza Valley into a canvas of pink and white, while the fields of Kashmir and Swat burst into vivid green. Temperatures are comfortable across the country, making spring the ideal window for both cultural tours and early-season treks in the lower mountain passes.
              </p>
              <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Top picks: Hunza, Swat, Kashmir, Neelum Valley</p>
            </div>
            <div className="rounded-3xl bg-yellow-50 dark:bg-yellow-900/20 p-7 border border-yellow-100 dark:border-yellow-800">
              <div className="text-3xl mb-3">☀️</div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Summer (Jun – Aug)</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                Summer is peak season for Pakistan's mountainous north. Gilgit-Baltistan, Skardu, and the Karakoram Highway are fully accessible and at their most spectacular. This is the best time for trekking to base camps, jeep safaris across high-altitude plateaus, camping beside glacial lakes, and undertaking serious mountaineering expeditions on peaks like K2, Broad Peak, and Nanga Parbat.
              </p>
              <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">Top picks: Skardu, Gilgit, K2, Fairy Meadows</p>
            </div>
            <div className="rounded-3xl bg-orange-50 dark:bg-orange-900/20 p-7 border border-orange-100 dark:border-orange-800">
              <div className="text-3xl mb-3">🍂</div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Autumn (Sep – Oct)</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                Autumn brings dramatic foliage across the northern valleys. Hunza, Naltar, and Ratti Gali are set ablaze with gold, amber, and red. Trekking conditions remain excellent as trails are clear and crowds thin out after summer. Autumn is also harvest season in Gilgit-Baltistan — a wonderful time to experience local culture, food festivals, and the warmth of village hospitality before winter closes the high passes.
              </p>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Top picks: Hunza, Naltar, Naran, Ratti Gali</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ABOUT PAKISTAN ═══════════════════════ */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label mb-2">Discover More</p>
              <h2 className="section-title mb-6">Why Visit Pakistan?</h2>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-5">
                Pakistan is one of the world's most underrated travel destinations — a country that surprises every visitor with its extraordinary diversity. In a single journey, you can stand on the roof of the world in the Karakoram, walk the Mughal gardens of Lahore, surf the warm waters of the Arabian Sea in Karachi, and explore the 5,000-year-old ruins of Mohenjo-daro in Sindh.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-5">
                The country is home to five of the world's 14 eight-thousanders, including the legendary K2 — the world's second highest peak. Pakistan's northern regions, including Gilgit-Baltistan and Azad Kashmir, offer some of the most dramatic mountain scenery on Earth, drawing trekkers, climbers, and photographers from across the globe.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-5">
                Beyond its natural wonders, Pakistan holds a treasure trove of cultural heritage. The ancient city of Taxila is an UNESCO World Heritage Site, while the Lahore Fort and Shalimar Gardens represent the pinnacle of Mughal architectural achievement. The bustling bazaars of Peshawar and the colonial avenues of Karachi tell the story of a nation shaped by centuries of trade, art, and conquest.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                Pakistani hospitality is legendary — locals are renowned for welcoming strangers with warmth, generosity, and genuine pride in sharing their homeland. Whether you're a solo backpacker, a family on holiday, or a group of adventure seekers, Pakistan offers experiences that will stay with you for a lifetime. Start your journey today with PAKEZY — your trusted guide to the very best of this remarkable country.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700">
                  <p className="text-4xl font-black text-primary-600 mb-1">8,611m</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">K2 — World's 2nd Highest Peak</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">Standing tall in the Karakoram range, K2 is the crown jewel of Pakistan's mountainous north and a dream destination for climbers worldwide.</p>
                </div>
                <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700">
                  <p className="text-4xl font-black text-primary-600 mb-1">5,000+</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Years of Continuous Civilisation</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">The Indus Valley Civilisation, one of the world's earliest, thrived in what is now Pakistan — making it one of humanity's oldest inhabited regions.</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700">
                  <p className="text-4xl font-black text-primary-600 mb-1">7 UNESCO</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">World Heritage Sites</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">From Mohenjo-daro and Taxila to the Lahore Fort and Makli Necropolis, Pakistan's heritage sites span thousands of years of human history.</p>
                </div>
                <div className="rounded-3xl bg-white dark:bg-gray-800 p-6 border border-gray-100 dark:border-gray-700">
                  <p className="text-4xl font-black text-primary-600 mb-1">4 Seasons</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Travel All Year Round</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">Pakistan's diverse climate means there is always a perfect destination in season — beach winters, spring blossoms, summer valleys, and autumn foliage.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            <div>
              <p className="section-label mb-2">Common Questions</p>
              <h2 className="section-title mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                Everything you need to know before planning your trip to Pakistan. Can't find an answer? Contact our team and we'll be happy to help.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">Is Pakistan safe for tourists?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Yes — the vast majority of Pakistan, including all major tourist areas such as Lahore, Islamabad, Hunza, Skardu, Swat, and the Karakoram Highway, is safe and welcoming for international visitors. Millions of tourists travel to Pakistan every year without incident. PAKEZY works exclusively with verified local guides and reputable operators to ensure your safety at every step of your journey.
                </p>
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">Do I need a visa to visit Pakistan?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Citizens of many countries can obtain a tourist visa on arrival or apply online through Pakistan's e-visa portal. The e-visa system covers tourists from over 175 countries and is typically processed within 24 to 72 hours. We recommend applying at least one week before your planned travel date. Our team can guide you through the documentation process if needed.
                </p>
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">What is the best way to travel around Pakistan?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Domestic flights connect major cities such as Karachi, Lahore, Islamabad, Peshawar, Gilgit, and Skardu. For scenic routes, road travel along the Karakoram Highway, the Swat Expressway, and the Makran Coastal Highway is highly recommended. Trains are a comfortable option between Punjab's major cities. For mountain areas, jeep hire with a local driver-guide is the most practical and immersive option.
                </p>
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">What currency is used in Pakistan?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  The official currency is the Pakistani Rupee (PKR). ATMs are widely available in cities and larger towns. It is advisable to carry some cash when travelling to remote mountain areas as ATM access can be limited. Major hotels and tour operators accept credit cards, but local markets, restaurants, and smaller guesthouses typically prefer cash payments.
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">What should I pack for a trip to northern Pakistan?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Layered clothing is essential as temperatures in the northern valleys and mountain regions can vary dramatically between day and night — even in summer. Pack a waterproof jacket, sturdy trekking shoes, a warm fleece or down jacket, sunscreen, and sunglasses for high-altitude UV exposure. Modest dress is appreciated across Pakistan, so bring lightweight, loose-fitting clothing that covers shoulders and knees.
                </p>
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">What languages are spoken in Pakistan?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Urdu is the national language and is widely understood across the country. English is widely spoken in cities, tourist areas, hotels, and by educated Pakistanis. Regional languages include Punjabi, Sindhi, Pashto, Balochi, Shina, and Balti, among many others. Most tourist operators and guides are fully fluent in English, making communication easy for international travelers.
                </p>
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">How do I book a tour package through PAKEZY?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Simply browse our featured packages on this page or visit the Tour Packages section to see all available options. Each package listing includes a full itinerary, price, group size, and booking form. You can submit a booking request online, and our team will confirm availability and guide you through the payment process within 24 hours. Custom itineraries are also available on request.
                </p>
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">What types of accommodation are available in Pakistan?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  Pakistan offers a full range of accommodation options. Major cities like Lahore, Karachi, and Islamabad have five-star international hotels alongside boutique guesthouses. In northern mountain towns such as Hunza, Skardu, and Gilgit, you'll find clean and comfortable mid-range hotels, traditional stone guesthouses, and scenic camping sites beside glacial rivers and lakes. PAKEZY lists only vetted and reviewed properties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-500 rounded-[2.5rem] overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 p-10 md:p-16">
              <div className="text-white max-w-lg">
                <p className="text-primary-200 text-sm font-bold tracking-widest uppercase mb-3">Start Your Adventure</p>
                <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                  Ready to explore beautiful Pakistan?
                </h2>
                <p className="text-primary-100 text-base leading-relaxed">
                  Join thousands of satisfied travelers who have explored Pakistan with us. From the moment you book to the day you return home, our team ensures every detail is handled — secure payments, vetted guides, and 24/7 traveler support. Your dream trip to Pakistan is just one click away.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-4 shrink-0">
                <Link
                  href="/packages"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl hover:bg-primary-50 active:scale-95 transition-all shadow-xl text-sm whitespace-nowrap"
                >
                  Browse Packages <ArrowRight size={16} />
                </Link>
                <Link
                  href="/destinations"
                  className="inline-flex items-center justify-center gap-2 bg-primary-800/40 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-primary-800/60 active:scale-95 transition-all text-sm whitespace-nowrap"
                >
                  Explore Destinations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}



