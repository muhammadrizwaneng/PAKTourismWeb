import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const explore = [
    { name: 'Popular Destinations', href: '/destinations' },
    { name: 'Tour Packages', href: '/packages' },
    { name: 'Find a Guide', href: '/guides' },
    { name: 'Hotels & Stays', href: '/hotels' },
    { name: 'Explore Map', href: '/map' },
    { name: 'My Wishlist', href: '/wishlist' },
    { name: 'Travel Checklist', href: '/checklist' },
    { name: 'Emergency Contacts', href: '/emergency' },
    { name: 'My Bookings', href: '/my-bookings' },
  ];

  const provinces = [
    'Gilgit-Baltistan', 'Punjab', 'Khyber Pakhtunkhwa',
    'Sindh', 'Balochistan', 'Azad Kashmir',
  ];

  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Top CTA strip */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Plan your next Pakistan adventure</h3>
            <p className="text-sm text-gray-400">Subscribe and get exclusive deals delivered to your inbox.</p>
          </div>
          <form className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 md:w-64 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              Subscribe <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

    
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary-500/20">
                <Image src="/icon.png" alt="PAKEZY" fill className="object-cover" sizes="40px" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">
                PAKE<span className="text-primary-500">ZY</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
              Smart Travel. Global Connection. Discover the hidden gems of Pakistan — from the peaks of Karakoram to the historic streets of Lahore.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-gray-900 hover:bg-primary-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                <Facebook size={16} />
              </Link>
              <Link href="#" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-gray-900 hover:bg-primary-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                <Instagram size={16} />
              </Link>
              <Link href="#" aria-label="Twitter" className="w-9 h-9 rounded-xl bg-gray-900 hover:bg-primary-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                <Twitter size={16} />
              </Link>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Explore</h4>
            <ul className="space-y-3">
              {explore.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200">
                      <ArrowRight size={12} className="text-primary-500" />
                    </span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Provinces */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">By Province</h4>
            <ul className="space-y-3">
              {provinces.map((p) => (
                <li key={p}>
                  <Link href={`/destinations?province=${p}`} className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200">
                      <ArrowRight size={12} className="text-primary-500" />
                    </span>
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-primary-500 shrink-0 mt-0.5">
                  <MapPin size={15} />
                </div>
                <span className="text-sm leading-relaxed">F-6/2, Islamabad, Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-primary-500 shrink-0">
                  <Phone size={15} />
                </div>
                <a href="tel:+923000000000" className="text-sm hover:text-primary-400 transition-colors">+92 300 000 0000</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-primary-500 shrink-0">
                  <Mail size={15} />
                </div>
                <a href="mailto:info@pakezy.com" className="text-sm hover:text-primary-400 transition-colors">info@pakezy.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>© {currentYear} PAKEZY. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-gray-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



