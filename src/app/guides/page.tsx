import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Star, MessageSquare, Phone, Languages, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_USER_IMAGE } from '@/lib/constants';
import SafeImage from '@/components/SafeImage';

const PAGE_SIZE = 3;

async function getGuides(page: number) {
  const [items, total] = await Promise.all([
    prisma.tourGuide.findMany({
      orderBy: [{ rating: 'desc' }, { name: 'asc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.tourGuide.count(),
  ]);
  return { items, total };
}

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10));
  const { items: guides, total } = await getGuides(page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageUrl(p: number) {
    return `/guides${p > 1 ? `?page=${p}` : ''}`;
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-black">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 py-16 mb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-4">Local Expertise</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">Expert Tour Guides in Pakistan</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed mb-4">
            Connect with certified local experts who know every corner of Pakistan. From veteran mountaineers who have summited K2 and Nanga Parbat to cultural historians who can recite 2,000 years of Gandharan Buddhist history from memory — PAKTourism's guide network is the finest in the country.
          </p>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base leading-relaxed mb-4">
            A great guide transforms a holiday into an education. In Pakistan, where landscapes change dramatically every hundred kilometres and where ancient languages, traditions, and cuisines sit side by side with contemporary urban culture, an informed local companion makes the difference between skimming the surface and truly understanding a place.
          </p>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base leading-relaxed mb-4">
            Every guide listed on PAKTourism has been verified through a registration process that confirms their professional credentials, language proficiency, first-aid certification (for mountain guides), and regional knowledge. Reviews from previous travellers are published alongside each profile without moderation bias, so you can make an informed choice before booking.
          </p>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
            Whether you need a half-day walking tour of Lahore's Walled City, a week-long trekking partner for the Fairy Meadows, or a full-month escort across multiple provinces, our guides offer flexible arrangements to suit every travel style and budget.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-2">Our Guides</p>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-10">Browse Verified Local Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide: any) => (
            <div key={guide.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm p-8 card-hover flex flex-col items-center text-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-primary-50 dark:ring-primary-900/20">
                <SafeImage 
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

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 pt-10" aria-label="Pagination">
            {page > 1 && (
              <Link
                href={pageUrl(page - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft size={15} /> Previous
              </Link>
            )}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageUrl(p)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                    p === page
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
            {page < totalPages && (
              <Link
                href={pageUrl(page + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Next <ChevronRight size={15} />
              </Link>
            )}
          </nav>
        )}
      </div>

      {/* Why use a guide section */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">Why It Matters</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">What a Local Guide Gives You That No App Can</h2>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Pakistan is not a country where a guidebook or GPS app fully prepares you for what you'll encounter. Road conditions in Gilgit-Baltistan change overnight after rain. Permits required for certain trekking zones near the Line of Control must be applied for in person at a local checkpoint — and knowing which checkpoint, when it opens, and who to ask for is knowledge that only comes from years of operating in the area. A good guide handles all of this so you don't have to.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              The cultural dimensions of travel in Pakistan are equally guide-dependent. The country has dozens of distinct regional languages, including Shina, Balti, Wakhi, Khowar, Pashto, Sindhi, Punjabi, and Saraiki. In remote valleys, Urdu is not always spoken widely, and English even less so. A guide who grew up in the valley you're visiting doesn't just translate words — they translate meaning, context, and unspoken social cues that determine whether your interactions with local communities are welcomed or misread.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              Safety is the third pillar. High-altitude trekking in Pakistan carries real risks: acute mountain sickness, sudden weather changes, rockfall on river-cut trails, and river crossings that are safe at 6am but impassable by noon when glacial meltwater peaks. Experienced mountain guides carry satellite communication devices, comprehensive first-aid kits, and the judgment to turn back when a route becomes dangerous — a call that inexperienced travellers are poorly placed to make for themselves.
            </p>
          </div>
          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600">Guide Specialisations</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Find the Right Expertise for Your Trip</h2>
            <div className="space-y-4">
              {([
                ['Mountain & Trekking Guides', 'Certified high-altitude guides for K2 base camp, Nanga Parbat, Fairy Meadows, Gondogoro La, and all major trekking routes in Gilgit-Baltistan and KPK. Includes porters and cooking-crew coordination for multi-day expeditions.'],
                ['Cultural Heritage Guides', 'Specialist historians for Lahore Fort, Badshahi Mosque, Mohenjo-daro, Taxila, Gandharan Buddhist sites, Sufi shrines, and Mughal architecture. Most are trained archaeologists or museum professionals.'],
                ['City & Urban Guides', 'Half-day and full-day guides for Lahore, Islamabad, Karachi, Peshawar, Quetta, and Multan. Excellent for food tours, bazaar walks, architectural photography, and understanding contemporary Pakistani urban life.'],
                ['Adventure & Outdoor Guides', 'Guides specialising in white-water rafting on the Kunhar and Swat rivers, mountain biking, paragliding, rock climbing, jeep safaris on off-road routes, and wildlife spotting in national parks.'],
                ['Photography Tour Guides', 'Guides with an eye for the best light, the hidden viewpoints, and the seasonal conditions that produce the most striking images. Popular among professional photographers and serious travel photographers.'],
              ] as [string, string][]).map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400"><span className="font-semibold text-gray-900 dark:text-white">{title}:</span> {desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* Regional guides section — shown only on page 1 */}
      {page === 1 && (
        <section className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-3">By Region</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4">Find the Right Guide for Every Part of Pakistan</h2>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-3xl mb-10">
              Pakistan's immense geographical and cultural diversity means that the best guide for a Lahore heritage walk is a completely different professional from the best guide for a K2 Base Camp trek or a Sindh archaeological tour. Our guide network covers all major regions of the country — here is a breakdown of what each region's guides specialise in and what to expect when booking.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {([
                {
                  region: 'Gilgit-Baltistan',
                  body: 'GB guides are the elite of Pakistan\'s outdoor tourism sector. This region — home to K2, Nanga Parbat, Broad Peak, Gasherbrum I and II, and dozens of other eight-thousanders — demands mountain guides with formal high-altitude training, fluency in local Shina and Balti languages, and the ability to coordinate multi-week expedition logistics including porters, cooks, and base camp support teams. Hunza Valley guides also specialise in heritage tourism, covering the Baltit and Altit Forts, the ancient Ganesh inscriptions on the Karakoram Highway, and the Silk Road trading history of the region. The best GB guides double as historians, naturalists, and emergency first responders.',
                },
                {
                  region: 'Khyber Pakhtunkhwa',
                  body: 'KPK guides operate across two distinct environments: the lush valley landscapes of Swat, Kaghan, Naran, and Chitral, and the culturally dense urban environment of Peshawar. Valley guides in KPK are experts in trekking routes, river crossings, and seasonal alpine conditions. Peshawar guides tend to focus on the city\'s 2,500-year history as a trading crossroads — covering the Qissa Khwani Bazaar, the Peshawar Museum (one of the finest collections of Gandharan Buddhist art in the world), the Bala Hisar Fort, and the Khyber Pass. Chitral guides have deep knowledge of the Kalash Valley and the unique, pre-Islamic indigenous culture of the Kalash people.',
                },
                {
                  region: 'Punjab',
                  body: 'Punjab is the historical and cultural heart of Pakistan, and its guides reflect that depth. Lahore guides are typically the most academically trained in the network — many hold degrees in history, archaeology, or architecture from the University of the Punjab or Lahore University of Management Sciences. Their specialisms include Mughal architecture (Lahore Fort, Badshahi Mosque, Wazir Khan Mosque, Shalimar Gardens), Sufi heritage (Data Darbar, Bibi Pak Daman), colonial-era architecture on the Mall Road, and the extraordinary bazaar culture of the Walled City. Taxila guides specialise in Buddhist heritage and are often qualified archaeologists who can contextualise the ruins within the broader Gandharan civilisation.',
                },
                {
                  region: 'Sindh',
                  body: 'Sindh guides operate in one of the most historically significant regions on earth. The province contains Mohenjo-daro — a 4,500-year-old Indus Valley city and UNESCO World Heritage Site — the vast Makli Necropolis (the largest Islamic graveyard in the world), the Ranikot Fort (the world\'s largest fort by perimeter), and Thatta, a former Mughal provincial capital. Sindh guides blend archaeology, Islamic heritage, and Sufi cultural knowledge. Many speak Sindhi in addition to Urdu and English, enabling access to local communities that are rarely encountered by tourists who travel without a guide. Karachi guides cover the city\'s colonial and coastal heritage as well as its vibrant contemporary art and food scene.',
                },
                {
                  region: 'Balochistan',
                  body: 'Balochistan is Pakistan\'s largest and most remote province, and its guides are specialists in navigating an extraordinary but challenging landscape. The province is home to Hingol National Park — Pakistan\'s largest national park — the Princess of Hope rock formation, the Makran Coastal Highway, the mud volcanoes of Chandragup, the ancient port of Ormara, and the highland city of Quetta surrounded by orchards and mountain passes. Balochistan guides are typically adventurous generalists with strong 4WD driving skills and emergency survival training. Visiting the province independently without a local guide who knows the routes and seasonal conditions is strongly discouraged.',
                },
                {
                  region: 'Azad Kashmir',
                  body: 'Azad Kashmir is famous for its intense natural beauty and relative accessibility from Islamabad. The Neelum Valley is the centrepiece — a glacial river corridor lined with pine forests, waterfalls, and traditional wooden villages. Guides in AJK specialise in hiking routes to viewpoints such as Ratti Gali Lake (3,700m), Sharda, Keran, and Taobat near the Line of Control. They are well-versed in the region\'s unique political geography and can help visitors navigate the permit requirements for areas near the LoC. AJK guides are also excellent companions for village homestay experiences, connecting travellers with local Kashmiri families for authentic hospitality.',
                },
                {
                  region: 'Islamabad & Rawalpindi',
                  body: 'The capital region\'s guides cover a surprisingly diverse brief. The Margalla Hills National Park — which begins at the northern edge of Islamabad — offers everything from gentle morning hikes to challenging multi-day trails toward Murree and the Galliyat. City guides cover the Faisal Mosque (one of the world\'s largest), the Pakistan Monument and Lok Virsa Museum (an essential introduction to Pakistani folk heritage), the Rose and Jasmine Garden, and the historic bazaars of old Rawalpindi including the famous Bara Bazaar. For political history enthusiasts, Rawalpindi guides offer tours of Liaquat Bagh and the colonial-era cantonment area.',
                },
              ] as { region: string; body: string }[]).map(({ region, body }) => (
                <div key={region} className="space-y-3">
                  <h3 className="text-base font-black text-gray-900 dark:text-white">{region}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works section */}
      <section className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-3">Simple Process</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-10">How to Book a Guide Through PAKTourism</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {([
              ['Browse Profiles', 'Filter guides by city, specialisation, language, and rating. Read verified reviews from previous travellers and check availability for your travel dates.'],
              ['Message Directly', 'Use the WhatsApp or phone contact on each guide profile to speak directly with the guide before booking. Discuss your itinerary, group size, fitness level, and any special requirements.'],
              ['Agree Terms', 'Confirm dates, daily rates or package price, inclusions (transport, meals, accommodation), and cancellation terms directly with your guide. PAKTourism recommends getting the agreed scope in writing via WhatsApp.'],
              ['Travel with Confidence', 'Meet your guide and begin your journey. Rate and review your experience after the trip to help future travellers make informed decisions.'],
            ] as [string, string][]).map(([title, desc], i) => (
              <div key={title} className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 font-black text-lg flex items-center justify-center">{i + 1}</div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Guide Rates in Pakistan</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Guide rates in Pakistan are among the most affordable in Asia relative to the quality of experience delivered. City and cultural heritage guides typically charge PKR 3,000–8,000 per day for an individual or couple, with group discounts available. Half-day rates for city walking tours usually run PKR 1,500–4,000. Mountain and trekking guides charge PKR 5,000–15,000 per day depending on altitude and technical difficulty, with separate porter fees typically ranging from PKR 2,500–5,000 per porter per day.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                For K2 Base Camp and other expeditions requiring government permits, the licensed guide fee is set by the Alpine Club of Pakistan and is non-negotiable. All mountain guide fees listed on PAKTourism profiles are in Pakistani Rupees; USD and EUR equivalents can be agreed at the time of booking. Tipping is appreciated but not expected — a customary tip of 10–15% of the total guide fee is the norm for good service.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Becoming a Listed Guide</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                PAKTourism welcomes applications from professional tour guides across all provinces of Pakistan. To be listed, guides must submit proof of a valid PTDC (Pakistan Tourism Development Corporation) guide licence, a government-issued CNIC, proof of language proficiency in at least one language beyond Urdu, and two references from previous international clients or a registered tour operator. Mountain guides additionally require a valid first-aid certificate and proof of successful completion of at least five commercial high-altitude treks.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Once approved, guides receive a verified profile page, visibility to thousands of monthly visitors from Pakistan's international tourism audience, and a direct booking contact mechanism via WhatsApp and phone. Listing on PAKTourism is currently free. We charge no commission on bookings arranged through the platform. Our goal is to grow Pakistan's tourism economy by connecting travellers directly with the people who make the country's experiences exceptional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 mb-3">Common Questions</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-10">Frequently Asked Questions About Hiring a Guide in Pakistan</h2>
          <div className="space-y-8">
            {([
              {
                q: 'Is it mandatory to hire a guide for trekking in Pakistan?',
                a: 'For many popular trekking routes — including the Fairy Meadows approach to Nanga Parbat base camp, the K2 base camp trek via the Baltoro Glacier, and the Gondogoro La crossing — the government of Gilgit-Baltistan requires all foreign trekkers to be accompanied by a licensed guide registered with the Alpine Club of Pakistan. For domestic travellers and on lower-altitude trails, guides are not legally required but are strongly recommended for safety, route-finding, and maximising the cultural dimension of the journey.',
              },
              {
                q: 'How do I know a guide is genuine and not a scam?',
                a: "Every guide on PAKTourism has been verified against their PTDC guide licence number before their profile is published. We cross-check licence numbers against the PTDC register annually. When messaging a guide, ask them to share their licence card via WhatsApp before confirming any booking or making any payment. A professional guide will always provide this without hesitation. We also publish unmoderated traveller reviews on each profile, so you can read direct accounts from previous clients.",
              },
              {
                q: 'Can female travellers hire female guides?',
                a: 'Yes. PAKTourism actively encourages the listing of female tour guides, and we have certified female guides available for cultural and city tours in Lahore, Islamabad, Karachi, and Peshawar. Female guides are particularly popular with women travelling solo or in women-only groups who want to explore local markets, home cooking experiences, and cultural sites with maximum comfort. The number of female certified mountain guides in Pakistan is growing, supported by initiatives from the Karakoram Club and Women on Wheels Pakistan.',
              },
              {
                q: 'What languages do Pakistan guides speak?',
                a: "Pakistan's certified guides typically speak Urdu plus one or more regional languages (Punjabi, Pashto, Sindhi, Balochi, Shina, Balti, Wakhi, or Khowar depending on their home region), and most speak at least functional English. Guides who work regularly with international tour operators typically have strong conversational to fluent English. French, German, Italian, Japanese, and Chinese-speaking guides are available in limited numbers — filter by language on this page to find guides with specific language capabilities.",
              },
              {
                q: 'What is the cancellation policy if I need to cancel a booked guide?',
                a: 'Cancellation terms are agreed directly between you and your guide at the time of booking, as PAKTourism facilitates the connection but does not process payments or enforce contract terms. Industry standard in Pakistan is: full refund for cancellations 14 or more days before the start date; 50% refund for cancellations 7–14 days before; no refund within 7 days unless the cancellation is due to a verifiable emergency or a government-issued travel restriction. Always confirm and document the cancellation policy with your guide before paying any deposit.',
              },
              {
                q: 'Do guides provide transport, or do I need to arrange it separately?',
                a: 'This varies by guide and package. Many guides — particularly those operating trekking packages — include all ground transport in their fee: airport transfers, inter-city transit by private 4WD, and last-mile access to trailheads. City guides typically do not include transport and assume you will arrange your own via Careem, InDrive, or a rented car. Always clarify what transport is and is not included when discussing your itinerary with a guide before confirming the booking.',
              },
            ] as { q: string; a: string }[]).map(({ q, a }, i) => (
              <div key={i} className="border-b border-gray-200 dark:border-gray-800 pb-8 last:border-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">{q}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
