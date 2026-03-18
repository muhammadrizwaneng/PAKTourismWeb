import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db';
import { Search, MapPin, Star, ArrowRight, ShieldCheck, Headphones, Map } from 'lucide-react';

async function getHomeData() {
  const [banners, featuredDestinations, featuredPackages] = await Promise.all([
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.destination.findMany({ 
      where: { isFeatured: true }, 
      take: 3, 
      include: { _count: { select: { attractions: true } } } 
    }),
    prisma.tourPackage.findMany({ 
      where: { isFeatured: true }, 
      take: 3, 
      include: { destination: { select: { title: true } } } 
    }),
  ]);

  return { banners, featuredDestinations, featuredPackages };
}

export default async function HomePage() {
  const { banners, featuredDestinations, featuredPackages } = await getHomeData();
  const mainBanner = banners[0];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero_video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/40 z-[1]" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Discover the Beauty of <span className="text-primary-500">Pakistan</span>
          </h1>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium tracking-wide">
            Mountains • History • Culture
          </p>
          
          <div className="bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 max-w-3xl mx-auto">
            <div className="flex-grow flex items-center px-6 py-3 w-full">
              <Search className="text-gray-400 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Where do you want to go?"
                className="w-full focus:outline-none text-gray-800"
              />
            </div>
            <button className="bg-primary-600 text-white px-8 py-4 rounded-xl md:rounded-full font-bold w-full md:w-auto hover:bg-primary-700 transition-all shadow-lg active:scale-95">
              Explore Now
            </button>
          </div>
        </div>
      </section>

      {/* Stats/Features */}
      <section className="py-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center space-x-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl text-primary-600">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Safe Travels</h3>
              <p className="text-sm text-gray-500">Verified guides & hotels</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl text-primary-600">
              <Headphones size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">24/7 Support</h3>
              <p className="text-sm text-gray-500">Always here to help you</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl text-primary-600">
              <Map size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Local Expertise</h3>
              <p className="text-sm text-gray-500">Curated by local experts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-24 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary-600 font-bold tracking-widest uppercase text-sm">Top Picks</span>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">Popular Destinations</h2>
            </div>
            <Link href="/destinations" className="text-primary-600 font-semibold flex items-center hover:underline">
              View All <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDestinations.map((dest) => (
              <Link key={dest.id} href={`/destinations/${dest.id}`} className="group group block">
                <div className="relative h-96 rounded-3xl overflow-hidden card-hover">
                  <Image 
                    src={dest.featuredImage || '/placeholder.png'} 
                    alt={dest.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8">
                    <div className="flex items-center text-primary-400 text-sm font-bold mb-2">
                       <MapPin size={14} className="mr-1" /> {dest.province}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{dest.title}</h3>
                    <p className="text-gray-300 text-sm line-clamp-2">{dest.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Packages */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-bold tracking-widest uppercase text-sm">Best Offers</span>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2">Recommended Tour Packages</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm card-hover">
                <div className="relative h-64">
                  <Image 
                    src={pkg.featuredImage || '/placeholder.png'} 
                    alt={pkg.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary-600 shadow-sm">
                    {pkg.durationDays} Days
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center text-xs text-gray-500 font-medium mb-3">
                    <MapPin size={12} className="mr-1" /> {pkg.destination.title}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-1">{pkg.title}</h3>
                  <div className="flex items-center justify-between mt-6">
                    <div>
                      <span className="text-gray-400 text-xs block">Price per person</span>
                      <span className="text-2xl font-bold text-primary-600">PKR {pkg.price.toLocaleString()}</span>
                    </div>
                    <Link 
                      href={`/packages/${pkg.id}`}
                      className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-primary-600 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
             
             <h2 className="text-4xl md:text-5xl font-extrabold mb-8 relative z-10">Ready to Start Your Journey?</h2>
             <p className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto relative z-10">
               Join thousands of travelers exploring the hidden wonders of Pakistan. Get personalized recommendations and secure bookings.
             </p>
             <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
               <button className="bg-white text-primary-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-50 transition-all shadow-xl active:scale-95">
                 Get Started
               </button>
               <button className="bg-primary-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-800 transition-all border border-primary-500/30 active:scale-95">
                 Contact Support
               </button>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
