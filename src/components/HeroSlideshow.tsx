'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  videoUrl?: string | null;
  linkUrl: string | null;
}

interface HeroSlideshowProps {
  banners: Banner[];
  children: React.ReactNode; // hero content (text, search bar etc.)
}

export default function HeroSlideshow({ banners, children }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const currentRef = useRef(0);

  const total = banners.length;

  const goTo = useCallback(
    (index: number) => {
      const next = (index + total) % total;
      currentRef.current = next;
      setCurrent(next);
    },
    [total],
  );

  const next = useCallback(() => goTo(currentRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(currentRef.current - 1), [goTo]);

  // Auto-advance every 6 s
  useEffect(() => {
    if (total <= 1) return;
    const tick = () => {
      goTo(currentRef.current + 1);
      timerRef.current = setTimeout(tick, 6000);
    };
    timerRef.current = setTimeout(tick, 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [total, goTo]);

  // Play / pause videos on slide change
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === current) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
        vid.currentTime = 0;
      }
    });
  }, [current]);

  if (total === 0) {
    // fallback: static default video
    return (
      <section className="relative h-screen min-h-[600px] flex items-end overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/hero_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
        <div className="relative z-10 w-full">{children}</div>
      </section>
    );
  }

  return (
    <section className="relative h-screen min-h-[600px] flex items-end overflow-hidden">
      {/* Slides */}
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          aria-hidden={i !== current}
        >
          {banner.videoUrl ? (
            <video
              ref={(el) => { videoRefs.current[i] = el; }}
              muted
              playsInline
              loop
              className="absolute inset-0 w-full h-full object-cover"
              poster={banner.imageUrl}
            >
              <source src={banner.videoUrl} type="video/mp4" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 hero-overlay z-20" />
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/40 to-transparent z-20" />

      {/* Hero content */}
      <div className="relative z-30 w-full">{children}</div>

      {/* Prev / Next arrows (only when multiple banners) */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous banner"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            aria-label="Next banner"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}

      {/* Link overlay for current slide (if linkUrl set) */}
      {banners[current]?.linkUrl && (
        <Link
          href={banners[current].linkUrl!}
          className="absolute inset-0 z-25"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
    </section>
  );
}
