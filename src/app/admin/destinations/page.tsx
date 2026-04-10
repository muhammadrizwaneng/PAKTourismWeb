import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus, Edit2, MapPin, Map as MapIcon } from 'lucide-react';
import DeleteDestinationButton from './DeleteDestinationButton';

async function getDestinations() {
  return await prisma.destination.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { attractions: true, packages: true, hotels: true }
      }
    }
  });
}

export default async function DestinationsAdminPage() {
  const destinations = await getDestinations();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Destinations</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all locations across Pakistan</p>
        </div>
        <Link
          href="/admin/destinations/new"
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus size={18} className="mr-2" /> Add New
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-900 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-900">
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Destination</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Location</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Resources</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((dest: any) => (
              <tr key={dest.id} className="border-b border-gray-50 dark:border-gray-900 last:border-none hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center">
                    {dest.featuredImage ? (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden mr-4">
                        <img src={dest.featuredImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4 text-gray-400 italic text-[10px]">No Image</div>
                    )}
                    <div>
                      <span className="block font-bold text-gray-900 dark:text-white">{dest.title}</span>
                      <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-widest">{dest.province || 'No Province'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center text-xs text-gray-500 font-medium">
                    <MapPin size={14} className="mr-2 text-primary-500" />
                    {dest.city || 'N/A'}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex gap-4">
                    <Link href={`/admin/attractions?destinationId=${dest.id}`} className="text-center group/item">
                      <span className="block text-xs font-black text-gray-900 dark:text-white leading-none group-hover/item:text-primary-600 transition-colors">{dest._count.attractions}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter group-hover/item:text-primary-500 transition-colors">Attractions</span>
                    </Link>
                    <Link href={`/admin/hotels?destinationId=${dest.id}`} className="text-center group/item opacity-50 cursor-not-allowed pointer-events-none">
                      <span className="block text-xs font-black text-gray-900 dark:text-white leading-none">{dest._count.hotels}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Hotels</span>
                    </Link>
                    <Link href={`/admin/packages?destinationId=${dest.id}`} className="text-center group/item opacity-50 cursor-not-allowed pointer-events-none">
                      <span className="block text-xs font-black text-gray-900 dark:text-white leading-none">{dest._count.packages}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Packages</span>
                    </Link>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all">
                      <Edit2 size={16} />
                    </button>
                    <DeleteDestinationButton id={dest.id} />
                  </div>
                </td>
              </tr>
            ))}
            {destinations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center">
                    <MapIcon size={48} className="text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium tracking-tight">No destinations found. Start by adding one!</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
