import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import { Destination, Taxonomy } from '@prisma/client';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';

import SafeImage from './SafeImage';

interface DestinationCardProps {
  destination: Destination & { 
    taxonomy: Taxonomy | null;
    _count: { attractions: number; hotels: number; packages: number }
  };
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link href={`/destinations/${destination.id}`} className="group block">
      <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm card-hover flex flex-col h-full">
        <div className="relative h-64 overflow-hidden">
          <SafeImage 
            src={destination.featuredImage || DEFAULT_TOURISM_IMAGE} 
            alt={destination.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {destination.isFeatured && (
            <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Featured
            </div>
          )}
          {destination.taxonomy && (
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">
              {destination.taxonomy.name}
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center text-primary-600 text-xs font-bold mb-2 uppercase tracking-tight">
            <MapPin size={12} className="mr-1" /> {destination.city}, {destination.province}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
            {destination.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6 flex-grow">
            {destination.description}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800 mt-auto">
            <div className="flex space-x-4 text-xs font-medium text-gray-400">
              <span className="flex items-center">
                 <span className="text-gray-700 dark:text-gray-200 mr-1">{destination._count.attractions}</span> Attractions
              </span>
              <span className="flex items-center">
                 <span className="text-gray-700 dark:text-gray-200 mr-1">{destination._count.packages}</span> Packages
              </span>
            </div>
            <div className="flex items-center text-primary-600 font-bold text-sm">
               Explore <ArrowRight size={14} className="ml-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ArrowRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}
