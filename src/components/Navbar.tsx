'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Heart, Search, Globe, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { favorites, hydrated } = useFavorites();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Discover', href: '/destinations' },
    { name: 'Trips', href: '/wishlist' },
    { name: 'Reviews', href: '/attractions' },
    { name: 'Packages', href: '/packages' },
  ];

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 bg-white border-b ${
          isScrolled ? 'py-2 shadow-sm' : 'py-4'
        } border-gray-100`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo Section */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary-500">
                  <Image src="/logo.png" alt="PakTourism" fill className="object-cover p-1.5" sizes="32px" />
                </div>
                <span className="text-xl font-black tracking-tight text-black">
                  PakTourism
                </span>
              </Link>

              {/* Desktop Main Search - Simple trigger */}
              <div className="hidden lg:flex items-center bg-gray-100/80 hover:bg-gray-200/60 transition-colors rounded-full px-4 py-2.5 w-72 cursor-pointer group">
                <Search size={18} className="text-gray-900" />
                <span className="ml-3 text-sm font-semibold text-gray-900">Search for a place</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2.5 text-sm font-bold rounded-full transition-all duration-200
                    ${pathname === link.href
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {link.name === 'Trips' && <Heart size={16} className={favorites.length > 0 ? 'fill-red-500 text-red-500' : ''} />}
                    {link.name}
                  </div>
                </Link>
              ))}
              
              <div className="h-6 w-[1px] bg-gray-200 mx-2" />

              <button className="p-3 text-black hover:bg-gray-100 rounded-full transition-colors">
                <Globe size={18} />
              </button>

              <Link
                href="/auth/signin"
                className="ml-2 flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all active:scale-95 shadow-sm"
              >
                Sign in
              </Link>
            </div>

            {/* Mobile Hamburger/Account */}
            <div className="md:hidden flex items-center gap-2">
              <button className="p-2 text-black hover:bg-gray-100 rounded-full">
                <User size={22} />
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-black hover:bg-gray-100 rounded-full"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-full max-w-xs bg-white shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b">
              <span className="font-black text-xl">Menu</span>
              <button onClick={() => setIsOpen(false)}><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between py-2 text-lg font-bold text-black border-b border-gray-50"
                >
                  {link.name}
                  {link.name === 'Trips' && hydrated && favorites.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{favorites.length}</span>
                  )}
                </Link>
              ))}
              <div className="pt-10">
                <Link
                  href="/auth/signin"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center bg-black text-white font-bold py-4 rounded-full"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
