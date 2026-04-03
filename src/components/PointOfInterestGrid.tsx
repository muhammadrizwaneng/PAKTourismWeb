'use client';

import React, { useState } from 'react';
import { MapPin, Phone, ChevronDown } from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from './SafeImage';

interface POI {
  id: number;
  title: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  gallery: string | null;
}

interface PointOfInterestGridProps {
  pois: POI[];
}

export const PointOfInterestGrid: React.FC<PointOfInterestGridProps> = ({ pois }) => {
  const grouped = pois.reduce<Record<string, POI[]>>((acc, poi) => {
    const cat = poi.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(poi);
    return acc;
  }, {});

  const categories = Object.keys(grouped);
  const [openCategory, setOpenCategory] = useState<string | null>(categories[0] || null);

  if (!pois || pois.length === 0) return null;

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const items = grouped[cat];
        const isOpen = openCategory === cat;

        return (
          <div key={cat} className="border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
            <button
              onClick={() => setOpenCategory(isOpen ? null : cat)}
              className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="font-bold text-gray-900 dark:text-white capitalize">{cat}</span>
                <span className="px-3 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold rounded-full">
                  {items.length}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((poi) => {
                  const gallery = poi.gallery ? JSON.parse(poi.gallery) : [];
                  const featuredImage = gallery[0] || DEFAULT_TOURISM_IMAGE;

                  return (
                    <div
                      key={poi.id}
                      className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="relative h-36 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <SafeImage
                          src={featuredImage}
                          alt={poi.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent" />
                      </div>

                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2 group-hover:text-primary-600 transition-colors">
                          {poi.title}
                        </h4>

                        {poi.address && (
                          <div className="flex items-start space-x-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <MapPin size={12} className="mt-0.5 text-primary-500 flex-shrink-0" />
                            <span className="line-clamp-2">{poi.address}</span>
                          </div>
                        )}

                        {poi.phone && (
                          <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Phone size={12} className="text-primary-500 flex-shrink-0" />
                            <span>{poi.phone}</span>
                          </div>
                        )}

                        {poi.latitude && poi.longitude && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${poi.latitude},${poi.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex items-center justify-center space-x-1.5 w-full py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-600 dark:text-white hover:text-primary-600 font-bold text-xs transition-all"
                          >
                            <MapPin size={12} />
                            <span>View on Maps</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
