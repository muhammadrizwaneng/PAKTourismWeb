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

async function getDestination(id: string) {
  const destination = await prisma.destination.findUnique({
    where: { id: parseInt(id) },
    include: {
      taxonomy: true,
      attractions: true,
      hotels: true,
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

  const galleryImages = destination.galleryImages ? JSON.parse(destination.galleryImages) : [];

  const hospitals = destination.pointsOfInterest.filter(
    (p) => p.category?.toLowerCase() === 'hospital'
  );
  const petrolPumps = destination.pointsOfInterest.filter(
    (p) => p.category?.toLowerCase() === 'fuel' || p.category?.toLowerCase().includes('petrol')
  );

  const cityName = destination.city || destination.title;

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">

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
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base whitespace-pre-wrap">
                {destination.description}
              </p>
            </section>

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

            {/* ── Attractions ── */}
            {(destination.attractions.length > 0 || hospitals.length > 0 || petrolPumps.length > 0) && (
              <section>
                <p className="section-label mb-2">Explore</p>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">
                  Must-Visit Attractions
                </h2>

                {/* Grid cards */}
                {destination.attractions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    {destination.attractions.map((attr) => {
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
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">

            {/* Quick book CTA */}
            <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-500 rounded-3xl p-6 text-white overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <p className="text-primary-100 text-xs font-bold tracking-widest uppercase mb-1">Plan your trip</p>
              <h3 className="text-xl font-black mb-4">{destination.title} Tour Packages</h3>

              <div className="space-y-3 mb-6">
                {destination.packages.length > 0 ? destination.packages.map((pkg) => (
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
                  {destination.hotels.map((hotel) => {
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

          </aside>
        </div>
      </div>
    </div>
  );
}


