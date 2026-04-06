'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone } from 'lucide-react';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solid = !isHome || isScrolled;

  const navLinks = [
    { name: 'Destinations', href: '/destinations' },
    { name: 'Packages', href: '/packages' },
    { name: 'Hotels', href: '/hotels' },
    { name: 'Guides', href: '/guides' },
    { name: 'My Bookings', href: '/my-bookings' },
  ];

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ${
          solid
            ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-gray-800 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md ring-2 ring-primary-500/20 group-hover:ring-primary-500/50 transition-all duration-300">
                <Image src="/logo.png" alt="PakTourism" fill className="object-cover" sizes="40px" />
              </div>
              <div className="flex flex-col leading-none">
                <span className={`text-xl font-black tracking-tighter transition-colors duration-300 ${solid ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                  PAK<span className="text-primary-500">Tourism</span>
                </span>
                <span className={`text-[10px] tracking-[0.15em] uppercase font-medium transition-colors duration-300 ${solid ? 'text-gray-400' : 'text-white/60'}`}>
                  Explore Pakistan
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${pathname === link.href
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : solid
                        ? 'text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            
            <div className="flex items-center gap-3">
              <a
                href="tel:+923000000000"
                className={`hidden lg:flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${solid ? 'text-gray-600 dark:text-gray-300 hover:text-primary-600' : 'text-white/80 hover:text-white'}`}
              >
                <Phone size={15} />
                +92 300 000 0000
              </a>
              <Link
                href="/packages"
                className="hidden md:inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-lg shadow-primary-900/20"
              >
                Book a Tour
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`md:hidden p-2 rounded-xl transition-colors ${solid ? 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-white hover:bg-white/10'}`}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay Menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />

        {/* Drawer */}
        <div className={`absolute top-0 right-0 h-full w-72 bg-white dark:bg-gray-950 shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 pt-20 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3.5 rounded-xl text-base font-semibold transition-colors ${
                  pathname === link.href
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-4">
              <Link
                href="/packages"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-3.5 rounded-xl transition-all"
              >
                Book a Tour
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

