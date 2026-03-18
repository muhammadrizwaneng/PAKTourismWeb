import { prisma } from '@/lib/db';
import Link from 'next/link';
import { 
  Map, 
  Hotel, 
  Package, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock 
} from 'lucide-react';

async function getStats() {
  const [destinations, hotels, packages, bookings] = await Promise.all([
    prisma.destination.count(),
    prisma.hotel.count(),
    prisma.tourPackage.count(),
    prisma.booking.count(),
  ]);

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { package: true }
  });

  return { destinations, hotels, packages, bookings, recentBookings };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { name: 'Destinations', value: stats.destinations, icon: Map, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Active Hotels', value: stats.hotels, icon: Hotel, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Tour Packages', value: stats.packages, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Total Bookings', value: stats.bookings, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">System Overview</h1>
        <p className="text-gray-500 text-sm">Welcome back. Here is what is happening with your tourism portal today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-900 flex shadow-sm">
              <div className={`p-4 rounded-2xl ${card.bg} dark:bg-gray-900 ${card.color} mr-6`}>
                <Icon size={24} />
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{card.name}</span>
                <span className="text-3xl font-black text-gray-900 dark:text-white">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Clock size={20} className="mr-3 text-primary-600" /> Recent Booking Requests
          </h2>
          <div className="bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-900 overflow-hidden">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-gray-50 dark:border-gray-900">
                   <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">Customer</th>
                   <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">Package</th>
                   <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                   <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase text-right">Date</th>
                 </tr>
               </thead>
               <tbody>
                 {stats.recentBookings.map((booking) => (
                   <tr key={booking.id} className="border-b border-gray-50 dark:border-gray-900 last:border-none hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                     <td className="px-8 py-6">
                        <span className="block font-bold text-gray-900 dark:text-white">{booking.name}</span>
                        <span className="block text-xs text-gray-400">{booking.email}</span>
                     </td>
                     <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                        {booking.package.title}
                     </td>
                     <td className="px-8 py-6 text-sm">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                     </td>
                     <td className="px-8 py-6 text-xs text-gray-400 text-right">
                        {new Date(booking.createdAt).toLocaleDateString()}
                     </td>
                   </tr>
                 ))}
                 {stats.recentBookings.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">No recent bookings found.</td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>
        </div>

        {/* Quick Help / Actions */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <CheckCircle size={20} className="mr-3 text-primary-600" /> Admin Checklist
          </h2>
          <div className="bg-primary-600 rounded-[2rem] p-8 text-white shadow-xl shadow-primary-500/20">
             <h3 className="text-lg font-bold mb-4">Daily Tasks</h3>
             <ul className="space-y-4 text-sm font-medium opacity-90">
               <li className="flex items-center"><div className="w-1.5 h-1.5 bg-white rounded-full mr-3" /> Approve pending reviews</li>
               <li className="flex items-center"><div className="w-1.5 h-1.5 bg-white rounded-full mr-3" /> Update package availability</li>
               <li className="flex items-center"><div className="w-1.5 h-1.5 bg-white rounded-full mr-3" /> Check guide ratings</li>
               <li className="flex items-center"><div className="w-1.5 h-1.5 bg-white rounded-full mr-3" /> Optimize banner visuals</li>
             </ul>
             <Link href="/admin/destinations" className="block w-full mt-8">
               <button className="w-full bg-white text-primary-600 py-3 rounded-xl font-bold hover:bg-primary-50 transition-colors">
                 Manage All Data
               </button>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
