'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FavoriteItem {
  id: number;
  type: 'destination' | 'package' | 'hotel';
  title: string;
  image?: string;
  slug?: string;
  subtitle?: string;
}

const STORAGE_KEY = 'paktourism_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  const save = useCallback((items: FavoriteItem[]) => {
    setFavorites(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggle = useCallback(
    (item: FavoriteItem) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === item.id && f.type === item.type);
        const next = exists
          ? prev.filter((f) => !(f.id === item.id && f.type === item.type))
          : [...prev, item];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const isFavorite = useCallback(
    (id: number, type: FavoriteItem['type']) =>
      favorites.some((f) => f.id === id && f.type === type),
    [favorites]
  );

  return { favorites, toggle, isFavorite, hydrated };
}
