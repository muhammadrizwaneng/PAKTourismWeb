'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Trash2, Package, Hotel, ArrowRight } from 'lucide-react';
import { useFavorites, FavoriteItem } from '@/hooks/useFavorites';
import SafeImage from '@/components/SafeImage';
import { DEFAULT_TOURISM_IMAGE } from '@/lib/constants';

const typeHref = (item: FavoriteItem) => {
  if (item.type === 'destination') return `/destinations/${item.id}`;
  if (item.type === 'package') return `/packages/${item.id}`;
  return `/hotels/${item.id}`;
};

const TypeIcon = ({ type }: { type: FavoriteItem['type'] }) => {
  if (type === 'package') return <Package size={14} className="text-primary-500" />;
  if (type === 'hotel') return <Hotel size={14} className="text-primary-500" />;
  return <MapPin size={14} className="text-primary-500" />;
};

export default function WishlistPageClient() {
  const { favorites, toggle, hydrated } = useFavorites();

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
            <Heart size={22} className="text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Wishlist</h1>
            <p className="text-gray-500 text-sm">{favorites.length} saved {favorites.length === 1 ? 'place' : 'places'}</p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
              <Heart size={32} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Nothing saved yet</h2>
            <p className="text-gray-400 mb-8 text-sm max-w-xs mx-auto">
              Tap the heart icon on any destination, package, or hotel to save it here.
            </p>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-colors active:scale-95"
            >
              Explore Destinations <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((item) => (
              <div key={`${item.type}-${item.id}`} className="relative group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                <Link href={typeHref(item)} className="block">
                  <div className="relative h-48 overflow-hidden">
                    <SafeImage
                      src={item.image || DEFAULT_TOURISM_IMAGE}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
                        <TypeIcon type={item.type} />
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-gray-400 text-xs">{item.subtitle}</p>
                    )}
                  </div>
                </Link>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  aria-label="Remove from wishlist"
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500 backdrop-blur-sm text-white rounded-full transition-all active:scale-90"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm hover:gap-3 transition-all"
            >
              Continue Exploring <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
