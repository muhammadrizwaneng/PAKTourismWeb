import Link from 'next/link';
import { MapPin, ArrowRight, Camera, Package } from 'lucide-react';
import { Destination, Taxonomy } from '@prisma/client';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from './SafeImage';

interface DestinationCardProps {
  destination: Destination & {
    taxonomy: Taxonomy | null;
    _count: { attractions: number; hotels: number; packages: number };
  };
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link href={`/destinations/${destination.id}`} className="group block h-full">
      <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 card-hover flex flex-col h-full shadow-sm">

        {/* Image */}
        <div className="relative h-60 overflow-hidden">
          <SafeImage
            src={destination.featuredImage || DEFAULT_TOURISM_IMAGE}
            alt={destination.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {destination.isFeatured && (
              <span className="bg-primary-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
                Featured
              </span>
            )}
            {destination.taxonomy && (
              <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full">
                {destination.taxonomy.name}
              </span>
            )}
          </div>

          {/* Province pill at bottom */}
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <MapPin size={11} className="text-primary-400" />
              {destination.city}, {destination.province}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
            {destination.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-5 flex-grow leading-relaxed">
            {destination.description || 'Explore this amazing destination in Pakistan.'}
          </p>

          {/* Stats + CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
              <span className="flex items-center gap-1.5">
                <Camera size={13} className="text-primary-500" />
                <span className="text-gray-700 dark:text-gray-200">{destination._count.attractions}</span> Spots
              </span>
              <span className="flex items-center gap-1.5">
                <Package size={13} className="text-primary-500" />
                <span className="text-gray-700 dark:text-gray-200">{destination._count.packages}</span> Pkgs
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-primary-600 font-bold text-sm group-hover:gap-2.5 transition-all">
              Explore <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
