import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MapPin, Calendar, Clock, Ticket, ArrowRight, Star, Hotel as HotelIcon, Package } from 'lucide-react';

async function getDestination(id: string) {
  const destination = await prisma.destination.findUnique({
    where: { id: parseInt(id) },
    include: {
      taxonomy: true,
      attractions: true,
      hotels: true,
      packages: true,
      reviews: { orderBy: { createdAt: 'desc' }, take: 5 },
      _count: { select: { attractions: true, hotels: true, packages: true, reviews: true } }
    }
  });

  if (!destination) return null;
  return destination;
}

export default async function DestinationDetailPage({ params }: { params: { id: string } }) {
  const destination = await getDestination(params.id);
  if (!destination) notFound();

  const galleryImages = destination.galleryImages ? JSON.parse(destination.galleryImages) : [];

  return (
    <div className="pb-24 bg-white dark:bg-black">
      {/* Hero Header */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <Image 
          src={destination.featuredImage || '/placeholder.png'} 
          alt={destination.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
             <div className="flex items-center space-x-2 text-primary-400 font-bold mb-4 uppercase tracking-widest text-sm">
               <MapPin size={16} /> <span>{destination.city}, {destination.province}</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">{destination.title}</h1>
             <div className="flex flex-wrap gap-4">
               <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl text-white">
                 <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Best Time to Visit</span>
                 <span className="font-semibold">{destination.bestTime || 'Year Round'}</span>
               </div>
               <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl text-white">
                 <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Average Rating</span>
                 <span className="font-semibold flex items-center"><Star size={14} className="text-yellow-400 mr-1 fill-yellow-400" /> 4.9 (128 reviews)</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16 pt-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            <section>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">About {destination.title}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {destination.description}
              </p>
            </section>

            {galleryImages.length > 0 && (
              <section>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Gallery Memories</h2>
                <div className="grid grid-cols-2 gap-4">
                   {galleryImages.map((img: string, i: number) => (
                     <div key={i} className={`relative rounded-3xl overflow-hidden shadow-lg ${i === 0 ? 'col-span-2 h-[400px]' : 'h-64'}`}>
                        <Image src={img} alt={`${destination.title} gallery ${i}`} fill className="object-cover transition-transform duration-700 hover:scale-105" />
                     </div>
                   ))}
                </div>
              </section>
            )}

            {/* Attractions */}
            {destination.attractions.length > 0 && (
              <section className="pt-8">
                <div className="flex justify-between items-end mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Must Visit Attractions</h2>
                </div>
                <div className="space-y-6">
                  {destination.attractions.map((attr) => (
                    <Link key={attr.id} href={`/attractions/${attr.id}`} className="block group">
                      <div className="glass p-6 rounded-[2rem] border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-8 transition-all hover:bg-gray-50/50 dark:hover:bg-gray-900/50 shadow-sm hover:shadow-xl">
                         <div className="relative w-full md:w-64 h-48 rounded-2xl overflow-hidden shrink-0">
                            <Image src={attr.gallery ? JSON.parse(attr.gallery)[0] || '/placeholder.png' : '/placeholder.png'} alt={attr.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                         </div>
                         <div className="flex-grow">
                           <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors">{attr.title}</h3>
                           <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-6">{attr.description}</p>
                           <div className="flex flex-wrap gap-6 text-sm">
                             <div className="flex items-center text-gray-400">
                               <Clock size={16} className="text-primary-500 mr-2" /> {attr.timings || '9 AM - 5 PM'}
                             </div>
                             <div className="flex items-center text-gray-400">
                               <Ticket size={16} className="text-primary-500 mr-2" /> {attr.entryFee || 'Free'}
                             </div>
                           </div>
                         </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-12">
            {/* Quick Actions / Packages */}
            <div className="bg-gray-900 dark:bg-primary-900/10 p-8 rounded-[2.5rem] text-white">
              <h3 className="text-2xl font-bold mb-6">Popular Packages</h3>
              <div className="space-y-6">
                {destination.packages.map((pkg) => (
                  <Link key={pkg.id} href={`/packages/${pkg.id}`} className="group block">
                    <div className="border-b border-white/10 pb-6 group-last:border-none">
                      <h4 className="font-bold mb-2 group-hover:text-primary-400 transition-colors">{pkg.title}</h4>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">{pkg.durationDays} Days</span>
                        <span className="text-primary-400 font-bold">PKR {pkg.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
                {destination.packages.length === 0 && (
                   <p className="text-gray-400 text-sm italic">No packages currently available for this destination.</p>
                )}
              </div>
              <Link href="/packages" className="w-full mt-8 bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-primary-700 transition-colors shadow-xl active:scale-95 flex items-center justify-center">
                Explore All Packages
              </Link>
            </div>

            {/* Hotels Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <HotelIcon size={24} className="mr-3 text-primary-600" /> Best Places to Stay
              </h3>
              <div className="space-y-4">
                {destination.hotels.map((hotel) => (
                  <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="block group">
                    <div className="glass border-gray-100 dark:border-gray-800 p-4 rounded-3xl transition-all hover:bg-gray-50/50 dark:hover:bg-gray-900/50 shadow-sm hover:shadow-md">
                       <div className="flex items-center space-x-4">
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                             <Image src={hotel.gallery ? JSON.parse(hotel.gallery)[0] || '/placeholder.png' : '/placeholder.png'} alt={hotel.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-primary-600 transition-colors">{hotel.title}</h4>
                            <div className="flex text-yellow-500 mb-1">
                              {[...Array(hotel.starRating || 3)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                            </div>
                            <p className="text-primary-600 font-bold text-xs">{hotel.priceRange || 'Check price'}</p>
                          </div>
                       </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
