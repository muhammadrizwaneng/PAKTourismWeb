import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MapPin, Star, Phone, Globe, MessageSquare, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';
import JsonLd from '@/components/JsonLd';

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
  const featuredImage = gallery[0] || DEFAULT_TOURISM_IMAGE;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paktourism.pk';

  const hotelSchema = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: hotel.title,
    description: hotel.description || undefined,
    url: `${SITE_URL}/hotels/${hotel.id}`,
    image: gallery.length > 0 ? gallery : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.address || undefined,
      addressLocality: hotel.destination.title,
      addressCountry: 'PK',
    },
    ...(hotel.latitude && hotel.longitude ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: hotel.latitude,
        longitude: hotel.longitude,
      },
    } : {}),
    ...(hotel.phone ? { telephone: hotel.phone } : {}),
    ...(hotel.email ? { email: hotel.email } : {}),
    ...(hotel.website ? { sameAs: hotel.website } : {}),
    starRating: {
      '@type': 'Rating',
      ratingValue: hotel.starRating || 3,
      bestRating: 5,
    },
    priceRange: hotel.priceRange || undefined,
    containedInPlace: {
      '@type': 'TouristDestination',
      name: hotel.destination.title,
      url: `${SITE_URL}/destinations/${hotel.destinationId}`,
    },
  };

  return (
    <div className="pb-24 bg-white dark:bg-black">
      <JsonLd data={hotelSchema} />
      {/* Hero Header */}
      <div className="relative h-[65vh] w-full overflow-hidden">
        <SafeImage 
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
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">About {hotel.title}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap mb-6">
                {hotel.description || `Experience the best of hospitality at ${hotel.title} located in the heart of ${hotel.destination.title}. This ${hotel.starRating}-star establishment offers comfortable accommodations and world-class service.`}
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Situated in {hotel.destination.title}, {hotel.destination.province}, {hotel.title} is ideally positioned for guests wishing to explore the region's most celebrated attractions, natural wonders, and cultural landmarks. Whether you're embarking on a mountain trekking expedition, a heritage tour, or a family holiday across Pakistan, a comfortable base makes all the difference — and {hotel.title} delivers on every count.
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {hotel.destination.title} attracts thousands of domestic and international visitors every year, drawn by its unique blend of scenery, history, and locally produced food. Staying here gives you the opportunity to explore at your own pace, with the assurance of professional hospitality and all essential amenities within reach.
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
                        <SafeImage src={img} alt={`${hotel.title} gallery ${i}`} fill className="object-cover transition-transform duration-700 hover:scale-105" />
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
               <p className="text-sm text-white/80 leading-relaxed">
                 Create a free PAKTourism account to unlock exclusive member-only discounts, priority booking, room upgrade requests, and personalised travel recommendations tailored to your interests and travel history.
               </p>
               <button className="mt-6 w-full bg-white text-primary-600 py-3 rounded-xl font-bold text-sm">
                 Join / Sign In
               </button>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border-gray-100 dark:border-gray-800 space-y-4">
              <h4 className="font-bold text-gray-900 dark:text-white">About {hotel.destination.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {hotel.destination.title} is a celebrated destination in {hotel.destination.province}, offering a compelling mix of natural beauty, historical significance, and vibrant local culture. Travellers here can explore ancient landmarks, sample traditional cuisine, and experience the legendary warmth of Pakistani hospitality.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Staying at {hotel.title} places you at the heart of {hotel.destination.title}, with easy access to the region's most popular attractions, bazaars, and scenic viewpoints.
              </p>
              <Link
                href={`/destinations/${hotel.destinationId}`}
                className="inline-block mt-1 text-xs font-bold text-primary-600 hover:underline"
              >
                Explore {hotel.destination.title} →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
