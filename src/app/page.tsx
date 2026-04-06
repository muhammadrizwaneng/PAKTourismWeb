import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  Search, MapPin, ArrowRight, Star, Calendar,
  Users, Award, HeartHandshake, Compass, Clock,
} from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';

async function getHomeData() {
  const [featuredDestinations, featuredPackages] = await Promise.all([
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
  ]);
  return { featuredDestinations, featuredPackages };
}

export default async function HomePage() {
  const { featuredDestinations, featuredPackages } = await getHomeData();

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
      desc: 'Every guide is verified, background-checked, and locally trained for a safe journey.',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      desc: 'Round-the-clock customer care ensures you are never alone on your trip.',
    },
    {
      icon: Award,
      title: 'Best Price Guarantee',
      desc: 'We match any lower price you find — no questions asked.',
    },
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-gray-950">

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative h-screen min-h-[600px] flex items-end overflow-hidden">
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero_video.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay */}
        <div className="absolute inset-0 hero-overlay" />
        {/* Top fade for navbar readability */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />

        {/* Content anchored to bottom */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
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
            From the peaks of K2 to the streets of Lahore — plan your perfect journey.
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
      </section>

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
                {featuredDestinations.slice(1, 3).map((dest) => (
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
              {featuredDestinations.slice(3, 6).map((dest) => (
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

      {/* ═══════════════════════ WHY US ═══════════════════════ */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="section-label mb-2">Why PakTourism</p>
            <h2 className="section-title">Travel smarter, not harder</h2>
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
            </div>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm hover:gap-3 transition-all"
            >
              View All Packages <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPackages.length > 0 ? featuredPackages.map((pkg) => (
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
                  Join thousands of travelers who discovered Pakistan with us. Secure bookings, expert guides, and unforgettable memories.
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



