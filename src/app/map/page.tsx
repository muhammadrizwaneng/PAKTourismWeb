import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { prisma } from '@/lib/db';
import { MapPin, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explore Map — PAKEZY',
  description: 'Discover all of Pakistan\'s top destinations on an interactive map.',
};

// Dynamic import disables SSR for the Leaflet map (browser-only)
const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading map…</span>
      </div>
    </div>
  ),
});

async function getDestinations() {
  return prisma.destination.findMany({
    select: {
      id: true,
      title: true,
      city: true,
      province: true,
      latitude: true,
      longitude: true,
      featuredImage: true,
      _count: { select: { attractions: true } },
    },
    orderBy: { title: 'asc' },
  });
}

export default async function MapPage() {
  const destinations = await getDestinations();
  const pinned = destinations.filter((d) => d.latitude && d.longitude);

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header bar */}
      <div className="flex items-center gap-4 px-5 py-4 bg-gray-950 border-b border-gray-800 pt-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-900/30 rounded-xl flex items-center justify-center">
            <Layers size={18} className="text-primary-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-lg leading-none">Explore Pakistan</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {pinned.length} destinations on the map
            </p>
          </div>
        </div>

        {/* Province stats pills */}
        <div className="hidden md:flex items-center gap-2 ml-auto flex-wrap">
          {Array.from(new Set(pinned.map((d) => d.province).filter(Boolean))).map((province) => (
            <span
              key={province}
              className="inline-flex items-center gap-1.5 bg-gray-800 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              <MapPin size={10} className="text-primary-400" />
              {province}
            </span>
          ))}
        </div>
      </div>

      {/* Map fills the rest */}
      <div className="flex-1 relative">
        <MapClient destinations={destinations} />
      </div>
    </div>
  );
}
