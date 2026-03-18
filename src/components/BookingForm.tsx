'use client';

import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface BookingFormProps {
  packageId: number;
  packageName: string;
  pricePerPerson: number;
}

export default function BookingForm({ packageId, packageName, pricePerPerson }: BookingFormProps) {
  const [numPeople, setNumPeople] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = numPeople * pricePerPerson;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      packageId,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      travelDate: new Date(formData.get('date') as string).toISOString(),
      numPeople: parseInt(formData.get('people') as string),
      notes: formData.get('notes'),
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to book');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="glass p-12 rounded-[2.5rem] border-primary-100 dark:border-primary-900/30 text-center">
        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center mx-auto mb-8 text-primary-600">
           <ShieldCheck size={40} />
        </div>
        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Booking Successful!</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Your request for <span className="font-bold text-primary-600">{packageName}</span> has been received. 
          Our team will contact you shortly to confirm your reservation.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="bg-primary-600 text-white px-10 py-4 rounded-full font-bold hover:bg-primary-700 transition-all"
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <div className="glass p-8 md:p-12 rounded-[2.5rem] border-gray-100 dark:border-gray-800 shadow-2xl">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book Your Journey</h3>
      <p className="text-sm text-gray-500 mb-8 font-medium">Reserve your spot and start your adventure.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
            <input required name="name" type="text" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary-500 py-4" placeholder="Ali Raza" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
            <input required name="email" type="email" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary-500 py-4" placeholder="ali@example.com" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Departure Date</label>
            <input required name="date" type="date" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary-500 py-4" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Number of People</label>
            <input 
              required 
              name="people" 
              type="number" 
              min="1" 
              value={numPeople}
              onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary-500 py-4" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Additional Notes (Optional)</label>
          <textarea name="notes" rows={3} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary-500" placeholder="Special requirements, dietary needs..."></textarea>
        </div>

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
           <div className="flex justify-between items-center mb-6">
             <span className="text-gray-500 font-medium">Total Amount</span>
             <span className="text-3xl font-black text-primary-600">PKR {totalPrice.toLocaleString()}</span>
           </div>
           
           <button 
             disabled={loading}
             className="w-full bg-primary-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/10 active:scale-95 disabled:opacity-50"
           >
             {loading ? <Loader2 className="animate-spin mr-2" /> : 'Confirm Booking'}
           </button>
        </div>
      </form>
    </div>
  );
}
