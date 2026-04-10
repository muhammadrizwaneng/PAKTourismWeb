'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue with Webpack/Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Destination {
  id: number;
  title: string;
  city: string | null;
  province: string | null;
  latitude: number | null;
  longitude: number | null;
  featuredImage: string | null;
  _count: { attractions: number };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildPopupMarkup(destination: Destination) {
  const title = escapeHtml(destination.title);
  const location = escapeHtml(
    [destination.city, destination.province].filter(Boolean).join(', ') || 'Pakistan'
  );
  const image = destination.featuredImage
    ? `<img
         src="${escapeHtml(destination.featuredImage)}"
         alt="${title}"
         class="w-full h-28 object-cover rounded-xl mb-2"
         onerror="this.style.display='none'"
       />`
    : '';

  return `
    <div class="p-1 min-w-[200px]">
      ${image}
      <strong class="block text-gray-900 text-sm font-bold mb-0.5">${title}</strong>
      <span class="text-gray-500 text-xs block mb-2">${location}</span>
      <span class="text-gray-400 text-xs block mb-2">${destination._count.attractions} attractions</span>
      <a
        href="/destinations/${destination.id}"
        class="block text-center bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
      >
        View Destination →
      </a>
    </div>
  `;
}

export default function MapClient({ destinations }: { destinations: Destination[] }) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapElementRef.current || mapInstanceRef.current) {
      return;
    }

    const validDestinations = destinations.filter(
      (destination): destination is Destination & { latitude: number; longitude: number } =>
        destination.latitude !== null && destination.longitude !== null
    );

    const map = L.map(mapElementRef.current, {
      center: [30.3753, 69.3451],
      zoom: 6,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    validDestinations.forEach((destination) => {
      L.marker([destination.latitude, destination.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(buildPopupMarkup(destination), { minWidth: 200 });
    });

    if (validDestinations.length > 1) {
      map.fitBounds(
        validDestinations.map((destination) => [destination.latitude, destination.longitude] as [number, number]),
        { padding: [40, 40] }
      );
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [destinations]);

  return <div ref={mapElementRef} className="w-full h-full z-0" />;
}
