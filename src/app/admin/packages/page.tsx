import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Package as PackageIcon, CheckCircle2, XCircle } from 'lucide-react';

async function getPackages() {
  return await prisma.tourPackage.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      destination: { select: { title: true } }
    }
  });
}

export default async function PackagesAdminPage() {
  const packages = await getPackages();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Tour Packages</h1>
          <p className="text-gray-500 text-sm mt-1">Manage fixed-price tours and itineraries</p>
        </div>
        <Link
          href="/admin/packages/new"
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus size={18} className="mr-2" /> Add New
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-900 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 dark:border-gray-900">
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Package</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Destination</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Price</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase">Featured</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg: any) => (
              <tr key={pkg.id} className="border-b border-gray-50 dark:border-gray-900 last:border-none hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center">
                    {pkg.featuredImage ? (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden mr-4">
                        <img src={pkg.featuredImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4 text-gray-400 italic text-[10px]">No Image</div>
                    )}
                    <div>
                      <span className="block font-bold text-gray-900 dark:text-white">{pkg.title}</span>
                      <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-widest">{pkg.durationDays} Days • Max {pkg.maxPeople}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs text-gray-500 font-medium">
                    {pkg.destination?.title || 'Unknown'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-bold text-primary-600">
                    PKR {pkg.price.toLocaleString()}
                  </span>
                </td>
                <td className="px-8 py-6">
                   {pkg.isFeatured ? (
                     <div className="flex items-center text-green-600 space-x-1">
                       <CheckCircle2 size={16} />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Featured</span>
                     </div>
                   ) : (
                     <div className="flex items-center text-gray-300 space-x-1">
                       <XCircle size={16} />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Standard</span>
                     </div>
                   )}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/packages/${pkg.id}`} className="p-2.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all">
                      <Edit2 size={16} />
                    </Link>
                    <button className="p-2.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center">
                    <PackageIcon size={48} className="text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium tracking-tight">No packages found. Start by adding one!</p>
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
