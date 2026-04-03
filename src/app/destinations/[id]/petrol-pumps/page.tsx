import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Fuel, MapPin, Phone, ArrowLeft } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';

async function getData(id: string) {
  const destination = await prisma.destination.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      title: true,
      city: true,
      pointsOfInterest: {
        where: { category: 'Fuel' },
        orderBy: { title: 'asc' },
      },
    },
  });
  if (!destination) return null;
  return destination;
}

export default async function PetrolPumpsPage({ params }: { params: { id: string } }) {
  const destination = await getData(params.id);
  if (!destination) notFound();

  const pumps = destination.pointsOfInterest;
  const cityName = destination.city || destination.title;

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/destinations/${destination.id}`}
            className="inline-flex items-center space-x-2 text-yellow-100 hover:text-white font-semibold mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to {destination.title}</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-white">
              <Fuel size={32} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white">{cityName} Petrol Pumps</h1>
              <p className="text-yellow-100 mt-1">{pumps.length} fuel stations found</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        {pumps.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-24 text-lg">
            No petrol pumps found for {cityName}.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pumps.map((pump) => {
              const gallery = pump.gallery ? JSON.parse(pump.gallery) : [];
              const featuredImage = gallery[0] || DEFAULT_TOURISM_IMAGE;

              return (
                <div
                  key={pump.id}
                  className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-yellow-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                        Fuel Station
                      </span>
                    </div>
                    <SafeImage
                      src={featuredImage}
                      alt={pump.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
                  </div>

                  <div className="p-5">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 group-hover:text-yellow-600 transition-colors">
                      {pump.title}
                    </h4>

                    <div className="space-y-2">
                      {pump.address && (
                        <div className="flex items-start space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin size={14} className="mt-0.5 text-yellow-500 flex-shrink-0" />
                          <span>{pump.address}</span>
                        </div>
                      )}
                      {pump.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Phone size={14} className="text-yellow-500 flex-shrink-0" />
                          <span>{pump.phone}</span>
                        </div>
                      )}
                    </div>

                    {pump.latitude && pump.longitude && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${pump.latitude},${pump.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-600 dark:text-white hover:text-yellow-600 font-bold text-sm transition-all"
                        >
                          <MapPin size={14} />
                          <span>View on Maps</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
