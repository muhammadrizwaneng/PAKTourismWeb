'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Plane, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Destinations', href: '/destinations' },
    { name: 'Packages', href: '/packages' },
    { name: 'Guides', href: '/guides' },
    { name: 'Bookings', href: '/my-bookings' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${(!isHome || isScrolled) ? 'glass py-3 shadow-md' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center group space-x-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-primary-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
               <img src="/logo.png" alt="PAKToursim Logo" className="w-full h-full object-cover" />
            </div>
            <span className={`text-2xl tracking-tighter transition-all duration-300 ${(!isHome || isScrolled) ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
              <span className="font-black uppercase tracking-tight">PAK</span>
              <span className="font-extralight text-primary-500">Toursim</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary-500 ${(!isHome || isScrolled) ? 'text-gray-700 dark:text-gray-200' : 'text-white/90'}`}
              >
                {link.name}
              </Link>
            ))}
            <button className="bg-primary-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-700 transition-colors">
              Sign In
            </button>
          </div>

          {/* Mobile button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`${(!isHome || isScrolled) ? 'text-gray-900 dark:text-white' : 'text-white'}`}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden glass border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-4 text-lg font-medium text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-800"
              >
                {link.name}
              </Link>
            ))}
            <button className="w-full mt-4 bg-primary-600 text-white px-5 py-3 rounded-xl font-semibold">
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
