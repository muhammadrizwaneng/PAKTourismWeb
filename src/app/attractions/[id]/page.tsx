import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MapPin, Clock, Ticket, ArrowLeft, Share2, Info, Compass } from 'lucide-react';
import { PointOfInterestGrid } from '@/components/PointOfInterestGrid';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';

async function getAttraction(id: string) {
  const attraction = await prisma.attraction.findUnique({
    where: { id: parseInt(id) },
    include: {
      destination: true,
      taxonomy: true,
      pointsOfInterest: true,
    }
  });

  if (!attraction) return null;
  return attraction;
}

export default async function AttractionDetailPage({ params }: { params: { id: string } }) {
  const attraction = await getAttraction(params.id);
  if (!attraction) notFound();

  const gallery = attraction.gallery ? JSON.parse(attraction.gallery) : [];
  const featuredImage = gallery[0] || DEFAULT_TOURISM_IMAGE;

  return (
    <div className="pb-24 bg-white dark:bg-black">
      {/* Hero Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <SafeImage 
          src={featuredImage} 
          alt={attraction.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        <div className="absolute top-24 left-8 z-10">
          <Link 
            href="/attractions" 
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-bold">Back to Attractions</span>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
             <div className="flex items-center space-x-2 text-primary-400 font-bold mb-4 uppercase tracking-widest text-sm">
               <MapPin size={16} /> 
               <Link href={`/destinations/${attraction.destinationId}`} className="hover:underline">
                {attraction.destination.title}
               </Link>
             </div>
             <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">{attraction.title}</h1>
             
             <div className="flex flex-wrap gap-4">
               {attraction.taxonomy && (
                 <div className="bg-primary-600 px-6 py-2 rounded-full text-white font-bold text-sm">
                   {attraction.taxonomy.name}
                 </div>
               )}
               <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full text-white flex items-center">
                 <Clock size={16} className="mr-2 text-primary-400" />
                 <span className="font-semibold text-sm">{attraction.timings || '9 AM - 5 PM'}</span>
               </div>
               <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full text-white flex items-center">
                 <Ticket size={16} className="mr-2 text-primary-400" />
                 <span className="font-semibold text-sm">{attraction.entryFee || 'Free Entry'}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section className="glass p-8 md:p-12 rounded-[2.5rem] border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600">
                  <Info size={24} />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Overview</h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {attraction.description}
              </p>
            </section>

            {attraction.pointsOfInterest && attraction.pointsOfInterest.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-gray-900 dark:text-white">
                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600">
                      <Compass size={24} />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Nearby Points of Interest</h2>
                  </div>
                  <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-600 dark:text-gray-400">
                    {attraction.pointsOfInterest.length} Locations
                  </span>
                </div>
                
                <PointOfInterestGrid pois={attraction.pointsOfInterest} />
              </section>
            )}

            {gallery.length > 1 && (
              <section>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Visual Journey</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {gallery.map((img: string, i: number) => (
                     <div key={i} className={`relative rounded-3xl overflow-hidden shadow-lg ${i % 3 === 0 ? 'md:col-span-2 h-80' : 'h-80'}`}>
                        <SafeImage src={img} alt={`${attraction.title} gallery ${i}`} fill className="object-cover transition-transform duration-700 hover:scale-105" />
                     </div>
                   ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="bg-gray-900 dark:bg-primary-900/10 p-8 rounded-[2.5rem] text-white">
              <h3 className="text-2xl font-bold mb-6">Plan Your Visit</h3>
              <div className="space-y-6 mb-8 text-gray-300">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-sm">Entry Fee</span>
                  <span className="font-bold text-white">{attraction.entryFee || 'Free Access'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-sm">Visiting Hours</span>
                  <span className="font-bold text-white">{attraction.timings || 'Standard'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Location</span>
                  <span className="font-bold text-white">{attraction.destination.title}</span>
                </div>
              </div>
              <div className="space-y-4">
                <Link 
                  href={`/destinations/${attraction.destinationId}`}
                  className="w-full block text-center bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-primary-700 transition-colors shadow-xl active:scale-95"
                >
                  Explore Destination
                </Link>
                <button className="w-full flex items-center justify-center space-x-2 border border-white/20 py-4 rounded-2xl font-bold hover:bg-white/5 transition-colors">
                  <Share2 size={18} />
                  <span>Share Attraction</span>
                </button>
              </div>
            </div>

            {/* Weather or Tips suggestion could go here */}
            <div className="glass p-8 rounded-[2rem] border-gray-100 dark:border-gray-800">
               <h4 className="font-bold text-gray-900 dark:text-white mb-4">Travel Tip</h4>
               <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                 "Make sure to visit during early morning hours to avoid crowds and get the best lighting for your photographs."
               </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
