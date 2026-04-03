import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Building2 } from 'lucide-react';
import SafeImage from './SafeImage';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';

interface Hospital {
  id: number;
  title: string;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  gallery: string | null;
}

interface HospitalsSectionProps {
  hospitals: Hospital[];
  cityName: string;
  destinationId: number;
}

export const HospitalsSection: React.FC<HospitalsSectionProps> = ({ hospitals, cityName, destinationId }) => {
  if (!hospitals || hospitals.length === 0) return null;

  const displayed = hospitals.slice(0, 3);

  return (
    <section className="pt-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3 text-gray-900 dark:text-white">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600">
            <Building2 size={24} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">{cityName} Hospitals</h2>
        </div>
        <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-600 dark:text-gray-400">
          {hospitals.length} Hospitals
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayed.map((hospital) => {
          const gallery = hospital.gallery ? JSON.parse(hospital.gallery) : [];
          const featuredImage = gallery[0] || DEFAULT_TOURISM_IMAGE;

          return (
            <div
              key={hospital.id}
              className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-red-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                    Hospital
                  </span>
                </div>
                <SafeImage
                  src={featuredImage}
                  alt={hospital.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
              </div>

              <div className="p-5">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-600 transition-colors">
                  {hospital.title}
                </h4>

                <div className="space-y-2">
                  {hospital.address && (
                    <div className="flex items-start space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin size={14} className="mt-0.5 text-red-500 flex-shrink-0" />
                      <span className="line-clamp-2">{hospital.address}</span>
                    </div>
                  )}
                  {hospital.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <Phone size={14} className="text-red-500 flex-shrink-0" />
                      <span>{hospital.phone}</span>
                    </div>
                  )}
                </div>

                {hospital.latitude && hospital.longitude && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-white hover:text-red-600 font-bold text-sm transition-all"
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

      {hospitals.length > 3 && (
        <div className="mt-8 text-center">
          <Link
            href={`/destinations/${destinationId}/hospitals`}
            className="inline-block px-8 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg active:scale-95"
          >
            View All {hospitals.length} Hospitals
          </Link>
        </div>
      )}
    </section>
  );
};
