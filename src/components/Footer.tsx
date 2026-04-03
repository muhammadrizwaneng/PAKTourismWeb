import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-16 pb-8 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-600">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter text-white uppercase">
                PAK<span className="text-primary-500 font-extralight lowercase">Tourism</span>
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Discover the hidden gems of Pakistan with our curated travel experiences. 
              From the peaks of Karakoram to the history of Lahore, we guide you through it all.
            </p>
            <div className="flex space-x-5">
              <Link href="#" className="hover:text-primary-500 transition-colors"><Facebook size={20} /></Link>
              <Link href="#" className="hover:text-primary-500 transition-colors"><Instagram size={20} /></Link>
              <Link href="#" className="hover:text-primary-500 transition-colors"><Twitter size={20} /></Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/destinations" className="hover:text-primary-400 transition-colors">Popular Destinations</Link></li>
              <li><Link href="/packages" className="hover:text-primary-400 transition-colors">Tour Packages</Link></li>
              <li><Link href="/guides" className="hover:text-primary-400 transition-colors">Find a Guide</Link></li>
              <li><Link href="/hotels" className="hover:text-primary-400 transition-colors">Hotels & Stays</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary-500 mt-0.5" />
                <span>Islamabad, Pakistan</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-primary-500" />
                <span>+92 300 0000000</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-primary-500" />
                <span>info@paktourism.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-6">Newsletter</h4>
            <p className="text-sm mb-4 text-gray-400">Subscribe for travel deals and tips.</p>
            <form className="flex space-x-2">
              <input 
                type="email" 
                placeholder="Your email"
                className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors">
                Go
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 space-y-4 md:space-y-0">
          <p>© 2024 PAKTourism. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
