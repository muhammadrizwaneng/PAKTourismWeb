'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Map, 
  Palmtree, 
  Hotel, 
  Package, 
  Users, 
  Image as ImageIcon, 
  Settings,
  ArrowLeft
} from 'lucide-react';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Destinations', href: '/admin/destinations', icon: Map },
  { name: 'Attractions', href: '/admin/attractions', icon: Palmtree },
  { name: 'Hotels', href: '/admin/hotels', icon: Hotel },
  { name: 'Packages', href: '/admin/packages', icon: Package },
  { name: 'Guides', href: '/admin/guides', icon: Users },
  { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Link href="/" className="flex items-center space-x-3 mb-10 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-600 shadow-lg shadow-primary-500/20">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 dark:text-white leading-none tracking-tight">PAK</span>
              <span className="text-primary-600 font-extralight text-sm tracking-widest uppercase">Toursim</span>
            </div>
          </Link>
          
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={18} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-100 dark:border-gray-900">
           <Link href="/" className="flex items-center text-xs font-bold text-gray-400 hover:text-primary-600 transition-colors">
             <ArrowLeft size={14} className="mr-2" /> Back to Website
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
