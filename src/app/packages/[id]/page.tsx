import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock, Users, ShieldCheck, MapPin, Star } from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';
import JsonLd from '@/components/JsonLd';

async function getPackage(id: string) {
  const pkg = await prisma.tourPackage.findUnique({
    where: { id: parseInt(id) },
    include: {
      destination: true,
      reviews: { take: 10, orderBy: { createdAt: 'desc' } }
    }
  });
  if (!pkg) return null;
  return pkg;
}

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
  const pkg = await getPackage(params.id);
  if (!pkg) notFound();

  const includes = pkg.includes ? JSON.parse(pkg.includes) : [];
  const excludes = pkg.excludes ? JSON.parse(pkg.excludes) : [];
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paktourism.pk';

  const packageSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: pkg.title,
    description: pkg.description || undefined,
    url: `${SITE_URL}/packages/${pkg.id}`,
    image: pkg.featuredImage || undefined,
    touristType: [{ '@type': 'Audience', audienceType: 'Tourists' }],
    itinerary: {
      '@type': 'ItemList',
      name: `${pkg.title} Itinerary`,
    },
    offers: {
      '@type': 'Offer',
      price: pkg.price,
      priceCurrency: 'PKR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/packages/${pkg.id}`,
    },
    provider: {
      '@type': 'TravelAgency',
      name: 'PAKTourism',
      url: SITE_URL,
    },
    duration: `P${pkg.durationDays}D`,
    maximumAttendeeCapacity: pkg.maxPeople || undefined,
    location: {
      '@type': 'TouristDestination',
      name: pkg.destination.title,
      url: `${SITE_URL}/destinations/${pkg.destinationId}`,
    },
  };

  return (
    <div className="pt-24 pb-24 bg-white dark:bg-black">
      <JsonLd data={packageSchema} />
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-12">
            <header>
              <div className="flex items-center space-x-2 text-primary-600 font-bold mb-4 uppercase tracking-widest text-sm">
                <MapPin size={16} /> <span>{pkg.destination.title}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">{pkg.title}</h1>
              
              <div className="flex items-center space-x-8 text-gray-500 mb-10 border-y border-gray-100 dark:border-gray-800 py-6">
                <div className="flex items-center">
                   <Clock className="mr-2 text-primary-500" size={20} />
                   <div>
                     <span className="block text-[10px] uppercase font-bold text-gray-400">Duration</span>
                     <span className="font-bold text-gray-900 dark:text-white uppercase">{pkg.durationDays} Days</span>
                   </div>
                </div>
                <div className="flex items-center">
                   <Users className="mr-2 text-primary-500" size={20} />
                   <div>
                     <span className="block text-[10px] uppercase font-bold text-gray-400">Capacity</span>
                     <span className="font-bold text-gray-900 dark:text-white uppercase">Max {pkg.maxPeople || 10} Persons</span>
                   </div>
                </div>
                <div className="flex items-center">
                   <Star className="mr-2 text-primary-500" size={20} />
                   <div>
                     <span className="block text-[10px] uppercase font-bold text-gray-400">Rating</span>
                     <span className="font-bold text-gray-900 dark:text-white uppercase">4.8 / 5.0</span>
                   </div>
                </div>
              </div>
            </header>

            <section className="relative h-96 rounded-[2.5rem] overflow-hidden shadow-xl">
               <SafeImage 
                 src={pkg.featuredImage || DEFAULT_TOURISM_IMAGE} 
                 alt={pkg.title}
                 fill
                 className="object-cover"
               />
            </section>

            <section className="space-y-8">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Adventure Overview</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {pkg.description}
              </p>
            </section>

            <section className="space-y-5">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Why Choose This Package?</h2>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                This package has been carefully crafted by PAKTourism's local travel experts who have personally explored every aspect of the itinerary. Every route, accommodation, activity, and transfer has been selected to maximise your comfort and give you the most rewarding experience possible in {pkg.destination.title}. We work directly with vetted local operators to keep prices fair and quality consistently high.
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Pakistan's tourism landscape is diverse and rapidly growing. By booking through PAKTourism, you benefit from our deep network of verified local guides, trusted guesthouses and hotels, and experienced drivers who know the roads and terrain intimately. We handle all the logistics so you can focus entirely on the experience.
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Our group sizes are intentionally kept small — a maximum of {pkg.maxPeople || 10} persons — to ensure personalised attention, a more intimate atmosphere, and minimal environmental impact on the destinations we visit. We believe responsible tourism benefits local communities and preserves Pakistan's natural and cultural heritage for future generations.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <section>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">What's Included</h3>
                 <ul className="space-y-4">
                   {includes.map((item: string, i: number) => (
                     <li key={i} className="flex items-start text-gray-500 dark:text-gray-400 text-sm">
                       <CheckCircle2 size={18} className="text-primary-500 mt-0.5 mr-3 shrink-0" /> {item}
                     </li>
                   ))}
                 </ul>
               </section>
               <section>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">What's Excluded</h3>
                 <ul className="space-y-4">
                   {excludes.map((item: string, i: number) => (
                     <li key={i} className="flex items-start text-gray-500 dark:text-gray-400 text-sm opacity-60">
                       <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-2 mr-4 shrink-0" /> {item}
                     </li>
                   ))}
                 </ul>
               </section>
            </div>
          </div>

          {/* Right Column: Booking */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <BookingForm 
                packageId={pkg.id} 
                packageName={pkg.title} 
                pricePerPerson={pkg.price} 
              />

              <div className="mt-8 p-8 border border-gray-100 dark:border-gray-800 rounded-[2rem] space-y-3">
                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 shrink-0">
                      <ShieldCheck size={24} />
                   </div>
                   <h4 className="font-bold text-gray-900 dark:text-white text-sm">Secure Booking Guarantee</h4>
                 </div>
                 <p className="text-xs text-gray-500 leading-relaxed">
                   Your booking is processed securely through PAKTourism's verified payment system. Once submitted, our team will confirm your reservation within 24 hours and send full trip details including meeting point, packing list, and emergency contacts. All payments are protected and refundable as per our cancellation policy.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
