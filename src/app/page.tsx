import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  Search, MapPin, ArrowRight, Calendar,
  Ticket,
} from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';
import JsonLd from '@/components/JsonLd';
import SearchHero from '@/components/SearchHero';
import RatingBubbles from '@/components/RatingBubbles';

async function getHomeData() {
  const [featuredDestinations, featuredPackages, allAttractions] = await Promise.all([
    prisma.destination.findMany({
      where: { isFeatured: true },
      take: 10,
      include: { _count: { select: { attractions: true } } },
    }),
    prisma.tourPackage.findMany({
      where: { isFeatured: true },
      take: 10,
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
  ]);

  // Pick the 6 richest: most gallery images (longer JSON string = more photos)
  type AttractionItem = (typeof allAttractions)[number];
  const popularAttractions = [...allAttractions]
    .sort((a: AttractionItem, b: AttractionItem) => (b.gallery?.length ?? 0) - (a.gallery?.length ?? 0))
    .slice(0, 10);

  return { featuredDestinations, featuredPackages, popularAttractions };
}


export default async function HomePage() {
  const { featuredDestinations, featuredPackages, popularAttractions } = await getHomeData();

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paktourism.pk';

  const destinationsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Popular Destinations in Pakistan',
    itemListElement: featuredDestinations.map((dest, i) => ({
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

  return (
    <div className="flex flex-col bg-white">
      <JsonLd data={[destinationsSchema]} />

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <SearchHero />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* ═══════════════════════ TRENDING DESTINATIONS ═══════════════════════ */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-black">Trending Destinations</h2>
              <p className="text-gray-500 font-medium mt-1">Traveler favorites in Pakistan</p>
            </div>
            <Link href="/destinations" className="text-sm font-bold border-b-2 border-transparent hover:border-black transition-all pb-1">
              View all
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide no-scrollbar -mx-4 px-4">
            {featuredDestinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/destinations/${dest.id}`}
                className="group relative min-w-[280px] md:min-w-[320px] aspect-[4/5] rounded-xl overflow-hidden block ta-card border-none ring-1 ring-gray-100"
              >
                <SafeImage
                  src={dest.featuredImage || DEFAULT_TOURISM_IMAGE}
                  alt={dest.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-black text-white leading-tight mb-2">{dest.title}</h3>
                  <div className="flex items-center gap-2">
                    <RatingBubbles rating={4.8} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════ TOP ATTRACTIONS ═══════════════════════ */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-black">Top Attractions</h2>
              <p className="text-gray-500 font-medium mt-1">Must-see sights for your next trip</p>
            </div>
            <Link href="/attractions" className="text-sm font-bold border-b-2 border-transparent hover:border-black transition-all pb-1">
              View all
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide no-scrollbar -mx-4 px-4">
            {popularAttractions.map((attr) => {
              const gallery = attr.gallery ? JSON.parse(attr.gallery) : [];
              const image = gallery[0] || DEFAULT_TOURISM_IMAGE;
              return (
                <Link
                  key={attr.id}
                  href={`/attractions/${attr.id}`}
                  className="min-w-[260px] md:min-w-[300px] flex flex-col group ta-card border-gray-100 overflow-hidden"
                >
                  <div className="relative h-48 overflow-hidden">
                    <SafeImage
                      src={image}
                      alt={attr.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <h3 className="text-base font-black text-black line-clamp-2 leading-[1.3] min-h-[42px] group-hover:underline underline-offset-2">
                      {attr.title}
                    </h3>
                    <RatingBubbles rating={4.5} />
                    <p className="text-xs font-bold text-gray-500">
                      {attr.destination.title}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════ FEATURED PACKAGES ═══════════════════════ */}
        <section className="mb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-black">Award-winning Tours</h2>
              <p className="text-gray-500 font-medium mt-1">Curated experiences in Pakistan</p>
            </div>
            <Link href="/packages" className="text-sm font-bold border-b-2 border-transparent hover:border-black transition-all pb-1">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPackages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/packages/${pkg.id}`}
                className="group flex flex-col ta-card border-gray-100 overflow-hidden"
              >
                <div className="relative h-56 overflow-hidden">
                  <SafeImage
                    src={pkg.featuredImage || DEFAULT_TOURISM_IMAGE}
                    alt={pkg.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/95 backdrop-blur-sm text-black text-[10px] font-black px-2.5 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                      <Calendar size={10} /> {pkg.durationDays} Days
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="text-[10px] font-black tracking-widest uppercase text-gray-500">
                    Tour Package
                  </div>
                  <h3 className="text-base font-black text-black leading-snug min-h-[48px] line-clamp-2">
                    {pkg.title}
                  </h3>
                  <RatingBubbles rating={4.9} />
                  <div className="pt-2 border-t border-gray-50 mt-auto">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Price from</div>
                    <div className="text-lg font-black text-black">
                      PKR {pkg.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════════════════════ CTA ═══════════════════════ */}
        <section className="mt-20 py-20 bg-gray-50 rounded-[40px] px-8 text-center border border-gray-100">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-black mb-6 tracking-tight">
              Get the latest travel tips for Pakistan
            </h2>
            <p className="text-gray-600 font-medium mb-10 leading-relaxed text-lg">
              Join millions of other travelers discovering the hidden gems of the Karakoram and beyond.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto btn-ta text-base px-10 py-4">Sign in</button>
              <button className="w-full sm:w-auto btn-ta-primary text-base px-10 py-4">See guides</button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}



