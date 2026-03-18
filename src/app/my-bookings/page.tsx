'use client';

import { useState } from 'react';
import { Search, Package, Calendar, Clock, MapPin, Tag } from 'lucide-react';

export default function MyBookingsPage() {
  const [userId, setUserId] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function fetchBookings(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;
    
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/bookings/${userId}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-black pb-24">
      <div className="max-w-4xl mx-auto px-4 pt-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">My Bookings</h1>
        <p className="text-gray-500 mb-12">Track your upcoming adventures and booking history.</p>

        <div className="glass p-8 rounded-[2rem] border-gray-100 dark:border-gray-800 mb-12">
           <form onSubmit={fetchBookings} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                 <input 
                  type="text" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your Email or Booking ID"
                  className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                 />
              </div>
              <button 
                type="submit"
                className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all active:scale-95"
              >
                Track Now
              </button>
           </form>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Fetching your bookings...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white dark:bg-gray-950 rounded-[2.5rem] border border-gray-100 dark:border-gray-900 p-8 shadow-sm flex flex-col md:flex-row gap-8">
                 <div className="relative w-full md:w-32 h-32 rounded-3xl overflow-hidden bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                    <Package className="text-primary-600" size={40} />
                 </div>
                 <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {booking.package.title}
                          </h3>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center">
                             <MapPin size={12} className="mr-1" /> {booking.package.destination.title}
                          </p>
                       </div>
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                         booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                         booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                       }`}>
                         {booking.status}
                       </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-50 dark:border-gray-900">
                       <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={16} className="text-primary-500 mr-2" />
                          <span>{new Date(booking.travelDate).toLocaleDateString()}</span>
                       </div>
                       <div className="flex items-center text-sm text-gray-500">
                          <Tag size={16} className="text-primary-500 mr-2" />
                          <span>PKR {booking.totalPrice.toLocaleString()}</span>
                       </div>
                       <div className="flex items-center text-sm text-gray-500">
                          <Clock size={16} className="text-primary-500 mr-2" />
                          <span>{booking.numPeople} People</span>
                       </div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        ) : searched && (
          <div className="text-center py-20 bg-white dark:bg-gray-950 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookings found</h3>
             <p className="text-gray-400">We couldn't find any bookings for "{userId}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
