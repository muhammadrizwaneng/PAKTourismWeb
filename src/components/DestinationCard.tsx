import Link from 'next/link';
import { MapPin, Camera, Package } from 'lucide-react';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from './SafeImage';
import FavoriteButton from './FavoriteButton';
import RatingBubbles from './RatingBubbles';

interface DestinationCardProps {
  destination: {
    id: number;
    title: string;
    description: string | null;
    city: string | null;
    province: string | null;
    featuredImage: string | null;
    isFeatured: boolean;
    taxonomy: {
      name: string;
    } | null;
    _count: {
      attractions: number;
      packages: number;
    };
  };
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <Link href={`/destinations/${destination.id}`} className="group block h-full">
      <div className="ta-card flex flex-col h-full bg-white overflow-hidden">
        {/* Image Section */}
        <div className="relative h-60 overflow-hidden">
          <SafeImage
            src={destination.featuredImage || DEFAULT_TOURISM_IMAGE}
            alt={destination.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {destination.isFeatured && (
              <span className="bg-primary-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                FEATURED
              </span>
            )}
            {destination.taxonomy && (
              <span className="bg-white text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                {destination.taxonomy.name.toUpperCase()}
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <div className="absolute top-3 right-3">
            <FavoriteButton
              size="sm"
              item={{
                id: destination.id,
                type: 'destination',
                title: destination.title,
                image: destination.featuredImage || undefined,
                subtitle: `${destination.city}, ${destination.province}`,
              }}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-grow gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-black text-black leading-tight group-hover:underline underline-offset-2 decoration-2 transition-all">
              {destination.title}
            </h3>
            <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs uppercase tracking-tight">
              <MapPin size={12} className="text-primary-500" />
              {destination.city}, {destination.province}
            </div>
          </div>

          <div className="my-1">
            <RatingBubbles rating={4.6} count={842} />
          </div>

          <p className="text-gray-600 text-sm font-medium line-clamp-3 leading-relaxed mb-4">
            {destination.description || 'Experience the majestic beauty and unique culture of this incredible destination in Pakistan.'}
          </p>

          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <Camera size={14} className="text-primary-500" />
                {destination._count.attractions} <span className="text-gray-500 opacity-70">Spots</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <Package size={14} className="text-primary-500" />
                {destination._count.packages} <span className="text-gray-500 opacity-70">Pkgs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
