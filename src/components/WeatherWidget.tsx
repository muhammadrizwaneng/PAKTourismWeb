'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, Thermometer, Eye } from 'lucide-react';

interface WeatherData {
  temp_C: string;
  FeelsLikeC: string;
  humidity: string;
  windspeedKmph: string;
  weatherDesc: string;
  visibility: string;
  weatherCode: string;
}

function WeatherIcon({ code, size = 24 }: { code: string; size?: number }) {
  const n = parseInt(code);
  if ([113].includes(n)) return <Sun size={size} className="text-yellow-400" />;
  if ([116, 119, 122].includes(n)) return <Cloud size={size} className="text-gray-400" />;
  if ([176, 179, 182, 185, 263, 266, 281, 284, 293, 296, 299, 302, 305, 308, 311, 314, 317, 320, 353, 356, 359].includes(n))
    return <CloudRain size={size} className="text-blue-400" />;
  if ([227, 230, 323, 326, 329, 332, 335, 338, 350, 362, 365, 368, 371, 374, 377, 392, 395].includes(n))
    return <CloudSnow size={size} className="text-blue-200" />;
  return <Cloud size={size} className="text-gray-400" />;
}

export default function WeatherWidget({ city }: { city: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const encoded = encodeURIComponent(city);
    fetch(`https://wttr.in/${encoded}?format=j1`)
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((data) => {
        const current = data.current_condition?.[0];
        if (!current) throw new Error('no data');
        setWeather({
          temp_C: current.temp_C,
          FeelsLikeC: current.FeelsLikeC,
          humidity: current.humidity,
          windspeedKmph: current.windspeedKmph,
          weatherDesc: current.weatherDesc?.[0]?.value ?? '',
          visibility: current.visibility,
          weatherCode: current.weatherCode,
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [city]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-5 animate-pulse">
        <div className="h-4 bg-white/20 rounded-full w-24 mb-3" />
        <div className="h-10 bg-white/20 rounded-full w-16 mb-2" />
        <div className="h-3 bg-white/20 rounded-full w-32" />
      </div>
    );
  }

  if (error || !weather) {
    return null; // silently hide if API unavailable
  }

  return (
    <div className="bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 rounded-3xl p-5 text-white overflow-hidden relative">
      {/* Background blur circles */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <p className="text-sky-200 text-xs font-bold tracking-widest uppercase mb-0.5">Live Weather</p>
          <p className="text-white font-bold text-sm">{city}</p>
        </div>
        <WeatherIcon code={weather.weatherCode} size={32} />
      </div>

      {/* Temp */}
      <div className="flex items-end gap-2 mb-1 relative z-10">
        <span className="text-5xl font-black leading-none">{weather.temp_C}°</span>
        <span className="text-sky-200 text-sm mb-1">C</span>
      </div>
      <p className="text-sky-200 text-xs mb-4 relative z-10 capitalize">{weather.weatherDesc}</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 relative z-10">
        <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2">
          <Droplets size={13} className="text-sky-200 shrink-0" />
          <div>
            <p className="text-[10px] text-sky-200">Humidity</p>
            <p className="text-xs font-bold">{weather.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2">
          <Wind size={13} className="text-sky-200 shrink-0" />
          <div>
            <p className="text-[10px] text-sky-200">Wind</p>
            <p className="text-xs font-bold">{weather.windspeedKmph} km/h</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2">
          <Thermometer size={13} className="text-sky-200 shrink-0" />
          <div>
            <p className="text-[10px] text-sky-200">Feels Like</p>
            <p className="text-xs font-bold">{weather.FeelsLikeC}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2">
          <Eye size={13} className="text-sky-200 shrink-0" />
          <div>
            <p className="text-[10px] text-sky-200">Visibility</p>
            <p className="text-xs font-bold">{weather.visibility} km</p>
          </div>
        </div>
      </div>

      <p className="text-sky-200/60 text-[10px] mt-3 text-right relative z-10">via wttr.in</p>
    </div>
  );
}
