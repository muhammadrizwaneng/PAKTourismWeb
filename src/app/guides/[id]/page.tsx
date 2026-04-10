import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Star, MessageSquare, Phone, Globe, Languages, ArrowLeft, Award, ThumbsUp, MapPinned } from 'lucide-react';
import { DEFAULT_USER_IMAGE, DEFAULT_TOURISM_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';
import JsonLd from '@/components/JsonLd';

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
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paktourism.pk';

  const guideSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: guide.name,
    url: `${SITE_URL}/guides/${guide.id}`,
    image: guide.photo || undefined,
    jobTitle: 'Tour Guide',
    description: guide.bio || undefined,
    knowsLanguage: languages,
    ...(guide.phone ? { telephone: guide.phone } : {}),
    ...(guide.whatsapp ? { contactPoint: { '@type': 'ContactPoint', telephone: guide.whatsapp, contactType: 'WhatsApp' } } : {}),
    ...(guide.rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: guide.rating, bestRating: 5, reviewCount: 12 } } : {}),
    worksFor: {
      '@type': 'TravelAgency',
      name: 'PAKTourism',
      url: SITE_URL,
    },
  };

  return (
    <div className="pt-24 pb-24 min-h-screen bg-gray-50 dark:bg-black">
      <JsonLd data={guideSchema} />
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
                <SafeImage 
                  src={guide.photo || DEFAULT_USER_IMAGE} 
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
                    href={`https://wa.me/${guide.whatsapp.replace(/\+/g, '').replace(/ /g, '')}?text=${encodeURIComponent(`Hello! I discovered your profile on PakTourism — a growing tourism platform that connects travelers with local guides across Pakistan.

I’m planning a trip and would love to know more about your services, packages, and availability.

You can also explore PakTourism here:
https://pktourism.infinityfreeapp.com/

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

            <section className="bg-gray-50 dark:bg-gray-900 p-10 md:p-12 rounded-[3.5rem] border border-gray-50 dark:border-gray-800 space-y-5">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Why Travel with a Local Guide?</h2>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                A local guide transforms an ordinary trip into an extraordinary journey. While travel apps and guidebooks provide general information, a local expert like {guide.name} brings the kind of deep, lived knowledge that no algorithm can replicate. They know which trails are open, which local family serves the best homemade food, and which hidden viewpoint offers the most breathtaking sunrise in {guide.city || 'the region'}.
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Safety is one of the most important reasons to choose a local guide when travelling in Pakistan's mountain regions. Terrain, weather, and road conditions can change rapidly in high-altitude areas such as Gilgit-Baltistan, Khyber-Pakhtunkhwa, and Azad Kashmir. An experienced guide knows the risks, the safe routes, and how to respond quickly in an emergency — ensuring that you and your group remain safe throughout the journey.
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Choosing a local guide also has a meaningful economic impact. Your booking directly supports a local professional and their family, contributing to the sustainable development of tourism in Pakistan's communities. PAKTourism verifies every guide on our platform to ensure they are qualified, trained in first aid and safety protocols, and committed to providing the highest standard of service to international and domestic travelers.
              </p>
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
