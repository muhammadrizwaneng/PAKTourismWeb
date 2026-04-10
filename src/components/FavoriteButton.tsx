'use client';

import { Heart } from 'lucide-react';
import { useFavorites, FavoriteItem } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  item: FavoriteItem;
  className?: string;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({ item, className = '', size = 'md' }: FavoriteButtonProps) {
  const { toggle, isFavorite, hydrated } = useFavorites();
  const active = hydrated && isFavorite(item.id, item.type);

  const iconSize = size === 'sm' ? 14 : 18;
  const padding = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <button
      type="button"
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      className={`${padding} rounded-full backdrop-blur-sm transition-all duration-200 active:scale-90
        ${active
          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
          : 'bg-black/40 text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30'
        } ${className}`}
    >
      <Heart
        size={iconSize}
        className={`transition-all ${active ? 'fill-white' : 'fill-none'}`}
      />
    </button>
  );
}
