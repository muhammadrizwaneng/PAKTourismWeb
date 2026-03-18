import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Star, MessageSquare, Phone, Globe, Languages, ArrowLeft, Award, ThumbsUp, MapPinned } from 'lucide-react';

async function getGuide(id: string) {
  const guide = await prisma.tourGuide.findUnique({
    where: { id: parseInt(id) }
  });

  if (!guide) return null;
  return guide;
}

export default async function GuideDetailPage({ params }: { params: { id: string } }) {
  const guide = await getGuide(params.id);
  if (!guide) notFound();

  const languages = guide.languages ? JSON.parse(guide.languages) : ['English', 'Urdu'];

  return (
    <div className="pt-24 pb-24 min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            href="/guides" 
            className="inline-flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-bold">Back to Guides</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Profile Sidebar */}
          <div className="lg:col-span-4">
            <div className="glass p-8 rounded-[3rem] border-gray-100 dark:border-gray-800 text-center sticky top-28">
              <div className="relative w-48 h-48 rounded-full overflow-hidden mx-auto mb-6 ring-8 ring-primary-50 dark:ring-primary-900/10">
                <Image 
                  src={guide.photo || '/placeholder.png'} 
                  alt={guide.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{guide.name}</h1>
              <div className="flex items-center justify-center space-x-2 text-yellow-500 mb-6">
                <Star size={20} fill="currentColor" />
                <span className="text-lg font-bold">{guide.rating || 'New'}</span>
                <span className="text-gray-400 font-medium text-sm">(12 reviews)</span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {languages.map((lang: string) => (
                  <span key={lang} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-bold">
                    {lang}
                  </span>
                ))}
              </div>

              <div className="space-y-4">
                {guide.whatsapp ? (
                  <a 
                    href={`https://wa.me/${guide.whatsapp.replace(/\+/g, '').replace(/ /g, '')}?text=${encodeURIComponent(`Hello! I discovered your profile on PakToursim — a growing tourism platform that connects travelers with local guides across Pakistan.

I’m planning a trip and would love to know more about your services, packages, and availability.

You can also explore PakToursim here:
https://pktoursim.infinityfreeapp.com/

Looking forward to hearing from you soon. Thank you!`)}`}
                    target="_blank"
                    className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <MessageSquare size={18} />
                    <span>Send Message</span>
                  </a>
                ) : (
                  <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-400 py-4 rounded-2xl font-bold cursor-not-allowed flex items-center justify-center space-x-2">
                    <MessageSquare size={18} />
                    <span>Send Message</span>
                  </button>
                )}

                {guide.phone && (
                  <a 
                    href={`tel:${guide.phone}`} 
                    className="w-full flex items-center justify-center space-x-2 border border-primary-200 dark:border-primary-900/30 text-primary-600 py-4 rounded-2xl font-bold hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                  >
                    <Phone size={18} />
                    <span>Call Expert</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* About & Reviews */}
          <div className="lg:col-span-8 space-y-12">
            <section className="bg-white dark:bg-gray-900 p-10 md:p-14 rounded-[3.5rem] border border-gray-50 dark:border-gray-800 shadow-sm">
              <div className="flex items-center space-x-3 mb-8">
                <Award size={28} className="text-primary-600" />
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Professional Bio</h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {guide.description || `${guide.name} is a professional tour guide with extensive knowledge of Pakistan's rich history and natural wonders. Dedicated to providing an unforgettable experience for every traveler.`}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-gray-50 dark:border-gray-800">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-2xl text-primary-600">
                    <ThumbsUp size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">98% Satisfied Clients</h4>
                    <p className="text-sm text-gray-500">Consistently high ratings from travelers worldwide.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-2xl text-primary-600">
                    <MapPinned size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Local Expert</h4>
                    <p className="text-sm text-gray-500">Deep knowledge of local customs, hidden gems, and history.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Traveler Reviews</h3>
              <div className="space-y-6">
                {[1, 2].map((i) => (
                   <div key={i} className="glass p-8 rounded-[2rem] border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 bg-gray-200 rounded-full" />
                           <span className="font-bold text-gray-900 dark:text-white">Traveler {i}</span>
                         </div>
                         <div className="flex text-yellow-500">
                           <Star size={14} fill="currentColor" />
                           <Star size={14} fill="currentColor" />
                           <Star size={14} fill="currentColor" />
                           <Star size={14} fill="currentColor" />
                           <Star size={14} fill="currentColor" />
                         </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 italic">
                        "An incredible experience! {guide.name} really knows the best spots and made our trip so much more meaningful with the historical context provided."
                      </p>
                   </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
