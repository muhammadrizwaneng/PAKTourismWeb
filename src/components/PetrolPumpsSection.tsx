import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Fuel } from 'lucide-react';
import SafeImage from './SafeImage';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';

interface PetrolPump {
  id: number;
  title: string;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  gallery: string | null;
}

interface PetrolPumpsSectionProps {
  pumps: PetrolPump[];
  cityName: string;
  destinationId: number;
}

export const PetrolPumpsSection: React.FC<PetrolPumpsSectionProps> = ({ pumps, cityName, destinationId }) => {
  if (!pumps || pumps.length === 0) return null;

  const displayed = pumps.slice(0, 3);

  return (
    <section className="pt-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3 text-gray-900 dark:text-white">
          <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center text-yellow-600">
            <Fuel size={24} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">{cityName} Petrol Pumps</h2>
        </div>
        <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-600 dark:text-gray-400">
          {pumps.length} Stations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayed.map((pump) => {
          const gallery = pump.gallery ? JSON.parse(pump.gallery) : [];
          const featuredImage = gallery[0] || DEFAULT_TOURISM_IMAGE;

          return (
            <div
              key={pump.id}
              className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
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
                      <span className="line-clamp-2">{pump.address}</span>
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

      {pumps.length > 3 && (
        <div className="mt-8 text-center">
          <Link
            href={`/destinations/${destinationId}/petrol-pumps`}
            className="inline-block px-8 py-3 bg-yellow-500 text-white rounded-2xl font-bold hover:bg-yellow-600 transition-colors shadow-lg active:scale-95"
          >
            View All {pumps.length} Petrol Pumps
          </Link>
        </div>
      )}
    </section>
  );
};
