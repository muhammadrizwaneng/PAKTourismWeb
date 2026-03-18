import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Comprehensive Pakistan Tourism database...');

  // ─── Taxonomies ──────────────────────────────────────────────────────────
  const taxonomies = [
    { id: 1, name: 'Mountain', type: 'destination' },
    { id: 2, name: 'Beach', type: 'destination' },
    { id: 3, name: 'Historical', type: 'destination' },
    { id: 4, name: 'Natural Wonder', type: 'attraction' },
    { id: 5, name: 'Monument', type: 'attraction' },
    { id: 6, name: 'Religious', type: 'attraction' },
    { id: 7, name: 'Lake', type: 'attraction' },
    { id: 8, name: 'Urban/City', type: 'destination' },
  ];

  for (const tax of taxonomies) {
    await prisma.taxonomy.upsert({
      where: { id: tax.id },
      update: { name: tax.name, type: tax.type },
      create: tax,
    });
  }

  // Helper to get taxonomies after upsert
  const mountainType = taxonomies.find(t => t.name === 'Mountain')!;
  const urbanType = taxonomies.find(t => t.name === 'Urban/City')!;
  const historicalType = taxonomies.find(t => t.name === 'Historical')!;
  const beachType = taxonomies.find(t => t.name === 'Beach')!;
  const naturalType = taxonomies.find(t => t.name === 'Natural Wonder')!;
  const monumentType = taxonomies.find(t => t.name === 'Monument')!;
  const religiousType = taxonomies.find(t => t.name === 'Religious')!;
  const lakeType = taxonomies.find(t => t.name === 'Lake')!;

  // ─── Destinations & Attractions ──────────────────────────────────────────

  const regions = [
    {
      province: 'Punjab',
      destinations: [
        {
          title: 'Lahore',
          slug: 'lahore',
          description: 'The cultural heart of Pakistan, home to Mughal-era architecture, vibrant bazaars, and legendary food.',
          city: 'Lahore',
          bestTime: 'October to March',
          latitude: 31.5204,
          longitude: 74.3587,
          taxonomyId: historicalType.id,
          isFeatured: true,
          attractions: [
            { title: 'Badshahi Mosque', slug: 'badshahi-mosque', description: 'One of the largest mosques in the world, a masterpiece of Mughal architecture.', taxonomyId: monumentType.id },
            { title: 'Shalimar Gardens', slug: 'shalimar-gardens', description: 'Mughal garden complex completed in 1642 AD.', taxonomyId: historicalType.id },
            { title: 'Lahore Fort', slug: 'lahore-fort', description: 'A massive citadel and a UNESCO World Heritage site.', taxonomyId: historicalType.id }
          ]
        },
        {
          title: 'Islamabad',
          slug: 'islamabad',
          description: 'The capital city of Pakistan, known for its greenery and modern infrastructure.',
          city: 'Islamabad',
          bestTime: 'September to May',
          latitude: 33.6844,
          longitude: 73.0479,
          taxonomyId: urbanType.id,
          isFeatured: true,
          attractions: [
            { title: 'Faisal Mosque', slug: 'faisal-mosque', description: 'The largest mosque in Pakistan, located on the foothills of Margalla Hills.', taxonomyId: religiousType.id },
            { title: 'Margalla Hills', slug: 'margalla-hills', description: 'Hill range part of the lesser Himalayas.', taxonomyId: naturalType.id },
            { title: 'Daman-e-Koh', slug: 'daman-e-koh', description: 'A viewing point and hill garden with panoramic views of Islamabad.', taxonomyId: naturalType.id }
          ]
        },
        {
          title: 'Murree',
          slug: 'murree',
          description: 'A popular hill station and a summer resort in the Galyat region.',
          city: 'Murree',
          province: 'Punjab',
          bestTime: 'December to August',
          taxonomyId: mountainType.id,
          attractions: [
            { title: 'Patriata (New Murree)', slug: 'patriata', description: 'Famous for its chairlift and cable car rides.', taxonomyId: naturalType.id }
          ]
        },
        {
          title: 'Multan',
          slug: 'multan',
          description: 'Known as the City of Saints, famous for its shrines and historic bazaars.',
          city: 'Multan',
          province: 'Punjab',
          taxonomyId: historicalType.id,
          attractions: [
            { title: 'Shrine of Shah Rukn-e-Alam', slug: 'rukn-e-alam', description: 'One of the most impressive examples of funerary architecture in the world.', taxonomyId: religiousType.id }
          ]
        },
        {
          title: 'Bahawalpur',
          slug: 'bahawalpur',
          description: 'A historic city home to the Nawabs, known for its palaces and desert forts.',
          city: 'Bahawalpur',
          province: 'Punjab',
          taxonomyId: historicalType.id,
          attractions: [
            { title: 'Derawar Fort', slug: 'derawar-fort', description: 'A large square fortress in the Cholistan Desert.', taxonomyId: historicalType.id },
            { title: 'Lal Suhanra National Park', slug: 'lal-suhanra', description: 'One of the largest national parks in South Asia.', taxonomyId: naturalType.id }
          ]
        },
        {
          title: 'Rawalpindi',
          slug: 'rawalpindi',
          description: 'The gateway to northern tourism and home to the military headquarters.',
          city: 'Rawalpindi',
          province: 'Punjab',
          taxonomyId: urbanType.id
        },
        {
          title: 'Chakwal',
          slug: 'chakwal',
          description: 'Known for its beautiful landscaping and historical sites.',
          city: 'Chakwal',
          province: 'Punjab',
          taxonomyId: historicalType.id,
          attractions: [
            { title: 'Katas Raj Temples', slug: 'katas-raj', description: 'A complex of several Hindu temples connected by walkways.', taxonomyId: religiousType.id },
            { title: 'Soon Valley', slug: 'soon-valley', description: 'A beautiful valley with lakes and waterfalls.', taxonomyId: naturalType.id }
          ]
        }
      ]
    },
    {
      province: 'Sindh',
      destinations: [
        {
          title: 'Karachi',
          slug: 'karachi',
          description: 'The financial capital and largest city of Pakistan, located on the Arabian Sea.',
          city: 'Karachi',
          taxonomyId: urbanType.id,
          isFeatured: true,
          attractions: [
            { title: 'Clifton Beach', slug: 'clifton-beach', description: 'One of the most popular beaches in Karachi.', taxonomyId: historicalType.id },
            { title: 'Quaid-e-Azam Mausoleum', slug: 'mazar-e-quaid', description: 'The final resting place of Muhammad Ali Jinnah.', taxonomyId: monumentType.id }
          ]
        },
        {
          title: 'Hyderabad',
          slug: 'hyderabad',
          description: 'A city rich in culture and history, known for its old bazaars.',
          city: 'Hyderabad',
          taxonomyId: urbanType.id
        },
        {
          title: 'Thatta',
          slug: 'thatta',
          description: 'Famous for its historical architecture and the massive necropolis.',
          city: 'Thatta',
          taxonomyId: historicalType.id,
          attractions: [
            { title: 'Makli Necropolis', slug: 'makli', description: 'One of the largest funerary sites in the world, a UNESCO site.', taxonomyId: historicalType.id }
          ]
        },
        {
          title: 'Sukkur',
          slug: 'sukkur',
          description: 'Known for its historic bridges and the Indus river views.',
          city: 'Sukkur',
          taxonomyId: historicalType.id,
          attractions: [
            { title: 'Lansdowne Bridge', slug: 'lansdowne-bridge', description: 'A 19th-century railway bridge.', taxonomyId: monumentType.id },
            { title: 'Sukkur Barrage', slug: 'sukkur-barrage', description: 'The landmark of Sukkur city.', taxonomyId: monumentType.id }
          ]
        },
        {
          title: 'Mohenjo-Daro',
          slug: 'mohenjo-daro',
          description: 'One of the world\'s earliest major urban settlements, an Indus Valley Civilization site.',
          city: 'Larkana',
          taxonomyId: historicalType.id,
          isFeatured: true
        }
      ]
    },
    {
      province: 'Khyber Pakhtunkhwa',
      destinations: [
        {
          title: 'Peshawar',
          slug: 'peshawar',
          description: 'One of the oldest living cities in South Asia, rich in Pathan culture.',
          city: 'Peshawar',
          taxonomyId: historicalType.id,
          attractions: [
            { title: 'Qissa Khwani Bazaar', slug: 'qissa-khwani', description: 'The famous "Street of Storytellers".', taxonomyId: historicalType.id },
            { title: 'Bala Hisar Fort', slug: 'bala-hisar', description: 'A historic fortress overlooking Peshawar city.', taxonomyId: historicalType.id }
          ]
        },
        {
          title: 'Swat Valley',
          slug: 'swat-valley',
          description: 'The "Switzerland of the East", famous for its lush valleys and rivers.',
          city: 'Mingora',
          taxonomyId: mountainType.id,
          isFeatured: true,
          attractions: [
            { title: 'Malam Jabba', slug: 'malam-jabba', description: 'The only ski resort in Pakistan.', taxonomyId: naturalType.id },
            { title: 'Fizagat Park', slug: 'fizagat-park', description: 'A popular recreational park in Mingora.', taxonomyId: naturalType.id }
          ]
        },
        {
          title: 'Chitral',
          slug: 'chitral',
          description: 'A remote and beautiful valley home to the unique Kalash people.',
          city: 'Chitral',
          taxonomyId: mountainType.id,
          attractions: [
            { title: 'Kalash Valley', slug: 'kalash-valley', description: 'Home to the Kalash people and their ancient culture.', taxonomyId: historicalType.id },
            { title: 'Chitral Gol National Park', slug: 'chitral-gol', description: 'A beautiful national park home to Markhors.', taxonomyId: naturalType.id }
          ]
        },
        {
          title: 'Abbottabad',
          slug: 'abbottabad',
          description: 'A military hub and the gateway to many beautiful hill stations.',
          city: 'Abbottabad',
          taxonomyId: urbanType.id,
          attractions: [
            { title: 'Nathiagali', slug: 'nathiagali', description: 'A popular hill station with hiking trails.', taxonomyId: mountainType.id }
          ]
        },
        {
          title: 'Naran & Kaghan Valley',
          slug: 'naran-kaghan',
          description: 'A popular summer holiday destination with lakes and mountains.',
          city: 'Naran',
          taxonomyId: mountainType.id,
          isFeatured: true,
          attractions: [
            { title: 'Lake Saif ul Malook', slug: 'saif-ul-malook', description: 'A legendary high-altitude lake.', taxonomyId: lakeType.id }
          ]
        }
      ]
    },
    {
      province: 'Balochistan',
      destinations: [
        {
          title: 'Quetta',
          slug: 'quetta',
          description: 'The capital of Balochistan, known as the fruit garden of Pakistan.',
          city: 'Quetta',
          taxonomyId: mountainType.id,
          attractions: [
            { title: 'Hanna Lake', slug: 'hanna-lake', description: 'A beautiful lake surrounded by hills.', taxonomyId: lakeType.id },
            { title: 'Urak Valley', slug: 'urak-valley', description: 'Famous for its fruit orchards.', taxonomyId: naturalType.id }
          ]
        },
        {
          title: 'Gwadar',
          slug: 'gwadar',
          description: 'A deep-sea port city with stunning coastal beaches.',
          city: 'Gwadar',
          taxonomyId: beachType.id,
          isFeatured: true,
          attractions: [
            { title: 'Hammerhead', slug: 'hammerhead', description: 'A massive rock formation along the coast.', taxonomyId: naturalType.id }
          ]
        },
        {
          title: 'Ziarat',
          slug: 'ziarat',
          description: 'Famous for its Junipur forest and the residence of Quaid-e-Azam.',
          city: 'Ziarat',
          taxonomyId: mountainType.id,
          attractions: [
            { title: 'Quaid-e-Azam Residency', slug: 'quaid-residency', description: 'The wooden building where Jinnah spent his last days.', taxonomyId: monumentType.id }
          ]
        },
        {
          title: 'Hingol National Park',
          slug: 'hingol',
          description: 'The largest national park in Pakistan, features unique rock formations.',
          city: 'Lasbela',
          taxonomyId: naturalType.id,
          attractions: [
            { title: 'Princess of Hope', slug: 'princess-of-hope', description: 'A naturally formed rock statue.', taxonomyId: naturalType.id }
          ]
        },
        {
          title: 'Kund Malir Beach',
          slug: 'kund-malir',
          description: 'A desert beach along the Makran Coastal Highway.',
          city: 'Lasbela',
          taxonomyId: beachType.id
        }
      ]
    },
    {
      province: 'Gilgit-Baltistan',
      destinations: [
        {
          title: 'Skardu',
          slug: 'skardu',
          description: 'The gateway to K2 and the world\'s highest peaks.',
          city: 'Skardu',
          taxonomyId: mountainType.id,
          isFeatured: true,
          attractions: [
            { title: 'Shangrila Resort', slug: 'shangrila-resort', description: 'A scenic resort by the Lower Kachura Lake.', taxonomyId: naturalType.id },
            { title: 'Deosai National Park', slug: 'deosai-park', description: 'The Land of Giants, a high altitude plateau.', taxonomyId: naturalType.id }
          ]
        },
        {
          title: 'Hunza',
          slug: 'hunza',
          description: 'A breathtaking valley known for its longevity and scenery.',
          city: 'Karimabad',
          taxonomyId: mountainType.id,
          isFeatured: true,
          attractions: [
            { title: 'Attabad Lake', slug: 'attabad-lake', description: 'A vibrant turquoise lake.', taxonomyId: lakeType.id },
            { title: 'Passu Cones', slug: 'passu-cones', description: 'Sharp mountain peaks along the KKH.', taxonomyId: mountainType.id }
          ]
        },
        {
          title: 'Gilgit',
          slug: 'gilgit',
          description: 'The capital of GB and a hub for major trekking expeditions.',
          city: 'Gilgit',
          taxonomyId: urbanType.id
        },
        {
          title: 'Khaplu',
          slug: 'khaplu',
          description: 'A historic valley home to the Khaplu Palace.',
          city: 'Khaplu',
          taxonomyId: historicalType.id,
          attractions: [
            { title: 'Khaplu Fort', slug: 'khaplu-fort', description: 'A 19th century fort and palace.', taxonomyId: historicalType.id }
          ]
        },
        {
          title: 'Shigar',
          slug: 'shigar',
          description: 'A beautiful valley home to the Shigar Fort.',
          city: 'Shigar',
          taxonomyId: mountainType.id,
          attractions: [
            { title: 'Shigar Fort', slug: 'shigar-fort', description: 'A heritage hotel and palace.', taxonomyId: historicalType.id }
          ]
        }
      ]
    },
    {
      province: 'Azad Jammu & Kashmir',
      destinations: [
        {
          title: 'Muzaffarabad',
          slug: 'muzaffarabad',
          description: 'The capital of AJK, located at the confluence of Neelum and Jhelum rivers.',
          city: 'Muzaffarabad',
          taxonomyId: urbanType.id,
          attractions: [
            { title: 'Red Fort', slug: 'red-fort-ajk', description: 'A historic fort overlooking the city.', taxonomyId: historicalType.id }
          ]
        },
        {
          title: 'Neelum Valley',
          slug: 'neelum-valley',
          description: 'A bowtie-shaped valley with spectacular scenery.',
          city: 'Athmuqam',
          taxonomyId: mountainType.id,
          isFeatured: true,
          attractions: [
            { title: 'Arang Kel', slug: 'arang-kel', description: 'A lush green village known as the pearl of Neelum Valley.', taxonomyId: naturalType.id }
          ]
        },
        {
          title: 'Rawalakot',
          slug: 'rawalakot',
          description: 'A beautiful hill station known as Pearl Valley.',
          city: 'Rawalakot',
          taxonomyId: mountainType.id,
          attractions: [
            { title: 'Banjosa Lake', slug: 'banjosa-lake', description: 'An artificial lake and a popular tourist spot.', taxonomyId: lakeType.id },
            { title: 'Toli Pir', slug: 'toli-pir', description: 'The highest hilltop in the region.', taxonomyId: naturalType.id }
          ]
        },
        {
          title: 'Baghsar Lake',
          slug: 'baghsar-lake',
          description: 'A crystal-clear lake located in Bhimber District.',
          city: 'Bhimber',
          taxonomyId: lakeType.id
        }
      ]
    }
  ];

  for (const region of regions) {
    for (const dest of region.destinations) {
      const destination = await prisma.destination.upsert({
        where: { slug: dest.slug },
        update: {
          title: dest.title,
          description: dest.description,
          city: dest.city,
          province: region.province,
          taxonomyId: dest.taxonomyId,
          isFeatured: dest.isFeatured || false,
          latitude: (dest as any).latitude || null,
          longitude: (dest as any).longitude || null
        },
        create: {
          title: dest.title,
          slug: dest.slug,
          description: dest.description,
          city: dest.city,
          province: region.province,
          taxonomyId: dest.taxonomyId,
          isFeatured: dest.isFeatured || false,
          latitude: (dest as any).latitude || null,
          longitude: (dest as any).longitude || null,
          featuredImage: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80`
        }
      });

      if ((dest as any).attractions) {
        for (const attr of (dest as any).attractions) {
          await prisma.attraction.upsert({
            where: { slug: attr.slug },
            update: {
              title: attr.title,
              description: attr.description,
              destinationId: destination.id,
              taxonomyId: attr.taxonomyId
            },
            create: {
              title: attr.title,
              slug: attr.slug,
              description: attr.description,
              destinationId: destination.id,
              taxonomyId: attr.taxonomyId,
              gallery: JSON.stringify([`https://source.unsplash.com/600x400/?${attr.title}`])
            }
          });
        }
      }
    }
  }

  // ─── Tour Guides ──────────────────────────────────────────────────────────
  const tourGuides = [
    { name: 'Deluxe Holidays', city: 'Karachi', description: 'Families & Luxury Groups', address: 'Shaheed-e-Millat / DHA Phase 8', phone: '+92 301 112 6426' },
    { name: 'Eventica Travels', city: 'Karachi', description: 'Couples & Small Families', address: 'Bahadurabad', phone: '+92 300 021 5111' },
    { name: 'Jahangard Travels', city: 'Karachi', description: 'Groups & Coastal Tours', address: 'Gulshan-e-Iqbal', phone: '+92 321 809 9985' },
    { name: 'Pakistan Travel & Tours', city: 'Lahore', description: 'Heritage & Families', address: 'Gulberg III', phone: '+92 300 849 0123' },
    { name: 'Bliss Travels', city: 'Lahore', description: 'Large Groups & Corporate', address: 'Main Boulevard, Gulberg', phone: '+92 300 117 1171' },
    { name: 'The Mad Hatters', city: 'Lahore', description: 'Solo Females & Culture', address: 'Experiential (Online/Lahore)', phone: '+92 331 441 5313' },
    { name: 'Click Pakistan', city: 'Islamabad', description: 'Families & Honeymoons', address: 'Blue Area', phone: '+92 311 112 3133' },
    { name: 'TripMaker.pk', city: 'Islamabad', description: 'Private Tours (Neelum/Swat)', address: 'Blue Area / F-7', phone: '+92 311 113 4567' },
    { name: 'Nature Explorer', city: 'Islamabad', description: 'Solo & Adventure Groups', address: 'Sector G-13/4', phone: '+92 348 045 6456' },
  ];

  for (const guide of tourGuides) {
    const slug = guide.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    await prisma.tourGuide.upsert({
      where: { slug },
      update: {
        name: guide.name,
        city: guide.city,
        description: guide.description,
        address: guide.address,
        phone: guide.phone,
      },
      create: {
        name: guide.name,
        slug,
        city: guide.city,
        description: guide.description,
        address: guide.address,
        phone: guide.phone,
      }
    });
  }

  console.log('✅ Seeding complete! All regions, destinations, and tour guides added.');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
