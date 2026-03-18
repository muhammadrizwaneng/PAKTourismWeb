import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MapPin, Star, Phone, Globe, MessageSquare, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';

async function getHotel(id: string) {
  const hotel = await prisma.hotel.findUnique({
    where: { id: parseInt(id) },
    include: {
      destination: true,
    }
  });

  if (!hotel) return null;
  return hotel;
}

export default async function HotelDetailPage({ params }: { params: { id: string } }) {
  const hotel = await getHotel(params.id);
  if (!hotel) notFound();

  const gallery = hotel.gallery ? JSON.parse(hotel.gallery) : [];
  const featuredImage = gallery[0] || '/placeholder.png';

  return (
    <div className="pb-24 bg-white dark:bg-black">
      {/* Hero Header */}
      <div className="relative h-[65vh] w-full overflow-hidden">
        <Image 
          src={featuredImage} 
          alt={hotel.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        <div className="absolute top-24 left-8 z-10">
          <Link 
            href="/hotels" 
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-bold">Back to Hotels</span>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
             <div className="flex items-center space-x-2 text-primary-400 font-bold mb-4 uppercase tracking-widest text-sm">
               <MapPin size={16} /> 
               <Link href={`/destinations/${hotel.destinationId}`} className="hover:underline">
                {hotel.destination.title}
               </Link>
             </div>
             <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">{hotel.title}</h1>
                <div className="flex bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-yellow-500 shadow-lg">
                  {[...Array(hotel.starRating || 3)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
             </div>
             
             <p className="text-white/80 max-w-2xl text-lg mb-8 line-clamp-2">
                {hotel.address}
             </p>

             <div className="flex flex-wrap gap-4">
               <div className="bg-primary-600 px-8 py-3 rounded-2xl text-white font-bold text-lg shadow-xl">
                 {hotel.priceRange || 'Contact for Pricing'}
               </div>
               <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl text-white flex items-center">
                 <Building2 size={20} className="mr-2 text-primary-400" />
                 <span className="font-semibold">{hotel.starRating}-Star Hotel</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            <section>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">About the Hotel</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {hotel.description || `Experience the best of hospitality at ${hotel.title} located in the heart of ${hotel.destination.title}. This ${hotel.starRating}-star establishment offers comfortable accommodations and world-class service.`}
              </p>
              
              <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6">
                {['Free WiFi', 'Room Service', 'Air Conditioning', 'Parking', 'Breakfast included', '24h Front Desk'].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                    <CheckCircle2 size={18} className="text-primary-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {gallery.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Gallery</h2>
                  <span className="text-sm font-medium text-gray-400">{gallery.length} Photos</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {gallery.map((img: string, i: number) => (
                     <div key={i} className={`relative rounded-3xl overflow-hidden shadow-lg ${i === 0 ? 'col-span-2 row-span-2 h-[500px]' : 'h-60'}`}>
                        <Image src={img} alt={`${hotel.title} gallery ${i}`} fill className="object-cover transition-transform duration-700 hover:scale-105" />
                     </div>
                   ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="glass p-8 rounded-[2.5rem] border-gray-100 dark:border-gray-800 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact & Booking</h3>
              
              <div className="space-y-4 mb-8">
                {hotel.phone && (
                  <a href={`tel:${hotel.phone}`} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl group hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
                    <div className="flex items-center">
                      <Phone size={20} className="text-primary-500 mr-3" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Call Now</span>
                    </div>
                    <span className="text-sm text-gray-500 group-hover:text-primary-600 transition-colors">{hotel.phone}</span>
                  </a>
                )}
                
                {hotel.whatsapp && (
                  <a href={`https://wa.me/${hotel.whatsapp}`} target="_blank" className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl group hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
                    <div className="flex items-center">
                      <MessageSquare size={20} className="text-green-500 mr-3" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">WhatsApp</span>
                    </div>
                    <span className="text-sm text-gray-500 group-hover:text-green-600 transition-colors">Chat</span>
                  </a>
                )}

                {hotel.website && (
                  <a href={hotel.website} target="_blank" className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl group hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                    <div className="flex items-center">
                      <Globe size={20} className="text-blue-500 mr-3" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Official Website</span>
                    </div>
                    <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">Visit</span>
                  </a>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 mb-6 flex items-start">
                   <MapPin size={18} className="mr-2 mt-0.5 shrink-0" />
                   {hotel.address}
                </p>
                <Link 
                  href={`/destinations/${hotel.destinationId}`}
                  className="w-full block text-center bg-gray-900 dark:bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 dark:hover:bg-primary-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>

            <div className="bg-primary-600 p-8 rounded-[2.5rem] text-white">
               <h4 className="font-bold text-xl mb-4">Member Perk</h4>
               <p className="text-sm text-white/80">
                 Sign in to get exclusive discounts and free upgrades at this property.
               </p>
               <button className="mt-6 w-full bg-white text-primary-600 py-3 rounded-xl font-bold text-sm">
                 Join / Sign In
               </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
