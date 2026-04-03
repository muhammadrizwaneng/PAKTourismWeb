import { prisma } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MessageSquare, Phone, Globe, Languages, MapPin } from 'lucide-react';
import { DEFAULT_USER_IMAGE } from '@/lib/constants';

async function getGuides() {
  return prisma.tourGuide.findMany({
    orderBy: [{ rating: 'desc' }, { name: 'asc' }],
  });
}

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-black">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Expert Tour Guides</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Connect with certified local experts who know every corner of Pakistan. 
            From expert mountaineers to cultural historians.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide: any) => (
            <div key={guide.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm p-8 card-hover flex flex-col items-center text-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-primary-50 dark:ring-primary-900/20">
                <Image 
                  src={guide.photo || DEFAULT_USER_IMAGE} 
                  alt={guide.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <Link href={`/guides/${guide.id}`}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 hover:text-primary-600 transition-colors">{guide.name}</h3>
              </Link>
              <div className="flex items-center justify-center text-yellow-500 mb-4">
                <Star size={16} fill="currentColor" className="mr-1" />
                <span className="text-sm font-bold">{guide.rating || 'New'}</span>
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 line-clamp-3">
                {guide.description}
              </p>

              <div className="w-full space-y-4 mb-8">
                <div className="flex items-center justify-center text-sm font-bold text-primary-600">
                  <MapPin size={14} className="mr-2" />
                  <span>{guide.city || 'Pakistan'}</span>
                </div>
                {guide.address && (
                  <div className="text-[11px] text-gray-400 font-medium line-clamp-1 italic px-4">
                    {guide.address}
                  </div>
                )}
                <div className="flex items-center justify-center text-[10px] text-gray-400 font-black uppercase tracking-widest pt-2 border-t border-gray-50 dark:border-gray-900 mx-4">
                  <Languages size={14} className="mr-2 text-primary-500" />
                  <span>{guide.languages ? JSON.parse(guide.languages).join(' • ') : 'English • Urdu'}</span>
                </div>
              </div>

              <div className="flex w-full space-x-3 mt-auto">
                {guide.whatsapp ? (
                  <a 
                    href={`https://wa.me/${guide.whatsapp.replace(/\+/g, '').replace(/ /g, '')}?text=${encodeURIComponent(`Hello! I discovered your profile on PakTourism — a growing tourism platform that connects travelers with local guides across Pakistan.

I’m planning a trip and would love to know more about your services, packages, and availability.

You can also explore PakTourism here:
https://pktourism.infinityfreeapp.com/

Looking forward to hearing from you soon. Thank you!`)}`}
                    target="_blank"
                    className="flex-grow bg-primary-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-primary-700 transition-colors flex items-center justify-center"
                  >
                    <MessageSquare size={16} className="mr-2" /> Message
                  </a>
                ) : (
                  <button className="flex-grow bg-gray-100 dark:bg-gray-800 text-gray-400 py-3 rounded-2xl font-bold text-sm cursor-not-allowed flex items-center justify-center">
                    <MessageSquare size={16} className="mr-2" /> Message
                  </button>
                )}
                
                {guide.phone && (
                   <a 
                    href={`tel:${guide.phone}`}
                    className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-2xl hover:bg-primary-100 transition-colors"
                   >
                     <Phone size={20} />
                   </a>
                )}
              </div>
            </div>
          ))}

          {guides.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-400 italic">No guides found in the database yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
