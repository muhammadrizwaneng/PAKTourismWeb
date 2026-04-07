import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter } as any);

interface PumpEntry { title: string; address: string; phone: string; latitude: number; longitude: number; }
interface CityPumps { city: string; pumps: PumpEntry[]; }

const cityPumps: CityPumps[] = [
  {
    city: 'Lahore',
    pumps: [
      { title: 'PSO Petrol Station - Gulberg', address: 'Main Boulevard Gulberg III, Lahore', phone: '042-35761234', latitude: 31.5204, longitude: 74.3587 },
      { title: 'Shell Fuel Station - DHA Phase 5', address: 'Syed Maratib Ali Road, DHA Phase 5, Lahore', phone: '042-35892100', latitude: 31.4775, longitude: 74.4009 },
      { title: 'Total Energies - Johar Town', address: 'Johar Town Block E, Lahore', phone: '042-35296400', latitude: 31.4697, longitude: 74.2728 },
      { title: 'Attock Petroleum - Model Town', address: 'Model Town Link Road, Lahore', phone: '042-35168900', latitude: 31.4912, longitude: 74.3236 },
      { title: 'PSO Petrol Station - Ferozepur Road', address: 'Ferozepur Road near Chungi Amar Sadhu, Lahore', phone: '042-35434100', latitude: 31.4632, longitude: 74.2891 },
      { title: 'Caltex - Garden Town', address: 'Jail Road, Garden Town, Lahore', phone: '042-35773022', latitude: 31.5025, longitude: 74.3302 },
      { title: 'PSO Petrol Station - Wapda Town', address: 'Wapda Town Phase 1, Lahore', phone: '042-35291780', latitude: 31.4600, longitude: 74.2645 },
      { title: 'Shell Fuel Station - Allama Iqbal Town', address: 'Raiwind Road, Allama Iqbal Town, Lahore', phone: '042-35410990', latitude: 31.4543, longitude: 74.3115 },
      { title: 'Total Energies - Cantt', address: 'Walton Road, Cantt, Lahore', phone: '042-36624500', latitude: 31.5419, longitude: 74.3895 },
      { title: 'PSO Petrol Station - Shahdara', address: 'GT Road, Shahdara, Lahore', phone: '042-37940220', latitude: 31.6089, longitude: 74.3165 },
    ],
  },
  {
    city: 'Karachi',
    pumps: [
      { title: 'PSO Petrol Station - Clifton', address: 'Khayaban-e-Iqbal, Clifton, Karachi', phone: '021-35861234', latitude: 24.8138, longitude: 67.0300 },
      { title: 'Shell Fuel Station - DHA', address: 'Khayaban-e-Seher, DHA Phase 6, Karachi', phone: '021-35344100', latitude: 24.7955, longitude: 67.0621 },
      { title: 'Total Energies - Gulshan-e-Iqbal', address: 'Main University Road, Gulshan-e-Iqbal, Karachi', phone: '021-34812500', latitude: 24.9226, longitude: 67.1121 },
      { title: 'PSO Petrol Station - North Karachi', address: 'Sector 11-C, North Karachi', phone: '021-36952100', latitude: 24.9871, longitude: 67.0632 },
      { title: 'Attock Petroleum - Malir', address: 'Malir Halt, Karachi', phone: '021-34510900', latitude: 24.8892, longitude: 67.2010 },
      { title: 'Shell Fuel Station - SITE Area', address: 'Manghopir Road, SITE, Karachi', phone: '021-32561400', latitude: 24.9178, longitude: 67.0012 },
      { title: 'PSO Petrol Station - Korangi', address: 'Korangi Industrial Area, Karachi', phone: '021-35071200', latitude: 24.8424, longitude: 67.1299 },
      { title: 'Total Energies - Saddar', address: 'Shahrah-e-Iraq, Saddar, Karachi', phone: '021-32212300', latitude: 24.8607, longitude: 67.0104 },
    ],
  },
  {
    city: 'Islamabad',
    pumps: [
      { title: 'PSO Petrol Station - Blue Area', address: 'Jinnah Avenue, Blue Area, Islamabad', phone: '051-2871234', latitude: 33.7295, longitude: 73.0931 },
      { title: 'Shell Fuel Station - F-10', address: 'Srinagar Highway, F-10, Islamabad', phone: '051-2291100', latitude: 33.7077, longitude: 73.0233 },
      { title: 'Total Energies - G-9', address: 'Islamabad Highway, G-9, Islamabad', phone: '051-2851400', latitude: 33.6844, longitude: 73.0479 },
      { title: 'PSO Petrol Station - G-11', address: 'Lehtrar Road, G-11, Islamabad', phone: '051-2281780', latitude: 33.6718, longitude: 73.0121 },
      { title: 'Attock Petroleum - I-8', address: 'Murree Road, I-8, Islamabad', phone: '051-4861900', latitude: 33.6811, longitude: 73.0782 },
      { title: 'Shell Fuel Station - E-11', address: 'Park Road, E-11, Islamabad', phone: '051-2215990', latitude: 33.7432, longitude: 73.0321 },
    ],
  },
  {
    city: 'Rawalpindi',
    pumps: [
      { title: 'PSO Petrol Station - Saddar', address: 'The Mall, Saddar, Rawalpindi', phone: '051-5551234', latitude: 33.5981, longitude: 73.0479 },
      { title: 'Shell Fuel Station - Murree Road', address: 'Murree Road, Rawalpindi', phone: '051-5481100', latitude: 33.6102, longitude: 73.0899 },
      { title: 'Total Energies - Chakala', address: 'Chakala, Airport Road, Rawalpindi', phone: '051-5701400', latitude: 33.6167, longitude: 73.1101 },
      { title: 'PSO Petrol Station - Raja Bazar', address: 'Liaquat Road, Raja Bazar, Rawalpindi', phone: '051-5501780', latitude: 33.6068, longitude: 73.0411 },
      { title: 'Attock Petroleum - Westridge', address: 'Westridge, Rawalpindi', phone: '051-5361900', latitude: 33.5879, longitude: 73.0321 },
    ],
  },
  {
    city: 'Multan',
    pumps: [
      { title: 'PSO Petrol Station - Cantt', address: 'Abdali Road, Cantt, Multan', phone: '061-4601234', latitude: 30.1968, longitude: 71.4681 },
      { title: 'Shell Fuel Station - Bosan Road', address: 'Bosan Road, Multan', phone: '061-6291100', latitude: 30.2412, longitude: 71.4499 },
      { title: 'Total Energies - Gulgasht', address: 'Gulgasht Colony, Multan', phone: '061-4771400', latitude: 30.2100, longitude: 71.4801 },
      { title: 'PSO Petrol Station - Shalimar', address: 'Shalimar Colony, Multan', phone: '061-4501780', latitude: 30.1755, longitude: 71.4321 },
      { title: 'Attock Petroleum - MDA Chowk', address: 'MDA Chowk, Multan', phone: '061-4551900', latitude: 30.2200, longitude: 71.4620 },
    ],
  },
  {
    city: 'Faisalabad',
    pumps: [
      { title: 'PSO Petrol Station - Susan Road', address: 'Susan Road, Faisalabad', phone: '041-8501234', latitude: 31.4210, longitude: 73.0851 },
      { title: 'Shell Fuel Station - Satyana Road', address: 'Satyana Road, Faisalabad', phone: '041-8711100', latitude: 31.4099, longitude: 73.0611 },
      { title: 'Total Energies - Narwala Road', address: 'Narwala Road, Faisalabad', phone: '041-8621400', latitude: 31.4388, longitude: 73.1011 },
      { title: 'PSO Petrol Station - Jhang Road', address: 'Jhang Road, Faisalabad', phone: '041-8451780', latitude: 31.4499, longitude: 72.9900 },
    ],
  },
  {
    city: 'Quetta',
    pumps: [
      { title: 'PSO Petrol Station - Jinnah Road', address: 'Jinnah Road, Quetta', phone: '081-2821234', latitude: 30.1943, longitude: 67.0099 },
      { title: 'Shell Fuel Station - Brewery Road', address: 'Brewery Road, Quetta', phone: '081-2841100', latitude: 30.1812, longitude: 66.9986 },
      { title: 'Total Energies - Airport Road', address: 'Airport Road, Quetta', phone: '081-2901400', latitude: 30.2512, longitude: 66.9377 },
      { title: 'PSO Petrol Station - Sariab Road', address: 'Sariab Road, Quetta', phone: '081-2501780', latitude: 30.1612, longitude: 66.9811 },
      { title: 'Attock Petroleum - Hazar Ganji', address: 'Hazar Ganji Chowk, Quetta', phone: '081-2651900', latitude: 30.1411, longitude: 66.9598 },
    ],
  },
  {
    city: 'Gwadar',
    pumps: [
      { title: 'PSO Petrol Station - Gwadar', address: 'Marine Drive, Gwadar', phone: '0864-210100', latitude: 25.1264, longitude: 62.3225 },
      { title: 'Shell Fuel Station - Gwadar Port', address: 'Port Road, Gwadar', phone: '0864-210200', latitude: 25.1189, longitude: 62.3312 },
      { title: 'Attock Petroleum - Gwadar City', address: 'Gwadar City Centre, Gwadar', phone: '0864-210300', latitude: 25.1224, longitude: 62.3179 },
    ],
  },
  {
    city: 'Hyderabad',
    pumps: [
      { title: 'PSO Petrol Station - Auto Bahn Road', address: 'Auto Bahn Road, Hyderabad', phone: '022-2621234', latitude: 25.3921, longitude: 68.3737 },
      { title: 'Shell Fuel Station - Qasimabad', address: 'Qasimabad, Hyderabad', phone: '022-2651100', latitude: 25.3751, longitude: 68.3411 },
      { title: 'Total Energies - Saddar', address: 'Saddar, Hyderabad', phone: '022-2731400', latitude: 25.3672, longitude: 68.3615 },
      { title: 'PSO Petrol Station - Latifabad', address: 'Latifabad Unit 8, Hyderabad', phone: '022-2981780', latitude: 25.4088, longitude: 68.3211 },
    ],
  },
  {
    city: 'Sukkur',
    pumps: [
      { title: 'PSO Petrol Station - Military Road', address: 'Military Road, Sukkur', phone: '071-5621234', latitude: 27.7052, longitude: 68.8574 },
      { title: 'Shell Fuel Station - Airport Road', address: 'Airport Road, Sukkur', phone: '071-5651100', latitude: 27.7212, longitude: 68.8766 },
      { title: 'Total Energies - Rohri', address: 'Rohri, Sukkur', phone: '071-5731400', latitude: 27.6921, longitude: 68.8952 },
    ],
  },
  {
    city: 'Peshawar',
    pumps: [
      { title: 'PSO Petrol Station - GT Road', address: 'Grand Trunk Road, Peshawar', phone: '091-5261234', latitude: 34.0151, longitude: 71.5249 },
      { title: 'Shell Fuel Station - Ring Road', address: 'Ring Road, Peshawar', phone: '091-5301100', latitude: 34.0011, longitude: 71.5011 },
      { title: 'Total Energies - Hayatabad', address: 'Hayatabad Phase 4, Peshawar', phone: '091-5841400', latitude: 33.9988, longitude: 71.4612 },
      { title: 'PSO Petrol Station - Saddar', address: 'Saddar Road, Peshawar', phone: '091-5271780', latitude: 34.0088, longitude: 71.5788 },
    ],
  },
  {
    city: 'Bahawalpur',
    pumps: [
      { title: 'PSO Petrol Station - Circular Road', address: 'Circular Road, Bahawalpur', phone: '062-2881234', latitude: 29.3956, longitude: 71.6836 },
      { title: 'Shell Fuel Station - Model Town', address: 'Model Town, Bahawalpur', phone: '062-2901100', latitude: 29.3812, longitude: 71.6612 },
      { title: 'Total Energies - Baghdad ul Jadeed', address: 'Baghdad ul Jadeed, Bahawalpur', phone: '062-2771400', latitude: 29.4188, longitude: 71.7011 },
    ],
  },
  {
    city: 'Hunza Valley',
    pumps: [
      { title: 'PSO Petrol Station - Karimabad', address: 'Karimabad Bazar, Hunza', phone: '05811-457100', latitude: 36.3211, longitude: 74.6551 },
      { title: 'Shell Fuel Station - Aliabad', address: 'Aliabad, Hunza', phone: '05811-450200', latitude: 36.2946, longitude: 74.6411 },
    ],
  },
  {
    city: 'Skardu',
    pumps: [
      { title: 'PSO Petrol Station - Skardu City', address: 'Skardu Bazar, Skardu', phone: '05811-960100', latitude: 35.2971, longitude: 75.6333 },
      { title: 'Shell Fuel Station - Skardu Road', address: 'Skardu-Islamabad Road, Skardu', phone: '05811-960200', latitude: 35.3088, longitude: 75.6211 },
    ],
  },
  {
    city: 'Gilgit',
    pumps: [
      { title: 'PSO Petrol Station - Gilgit', address: 'Gilgit Bazar, Gilgit', phone: '05811-920100', latitude: 35.9210, longitude: 74.3077 },
      { title: 'Total Energies - Jutial', address: 'Jutial, Gilgit', phone: '05811-921200', latitude: 35.9100, longitude: 74.2988 },
    ],
  },
  {
    city: 'Swat Valley',
    pumps: [
      { title: 'PSO Petrol Station - Mingora', address: 'Mingora Bazar, Swat', phone: '0946-710100', latitude: 34.7754, longitude: 72.3601 },
      { title: 'Shell Fuel Station - Saidu Sharif', address: 'Saidu Sharif, Swat', phone: '0946-712200', latitude: 34.7499, longitude: 72.3499 },
    ],
  },
  {
    city: 'Murree',
    pumps: [
      { title: 'PSO Petrol Station - Murree', address: 'The Mall, Murree', phone: '051-3411234', latitude: 33.9063, longitude: 73.3900 },
      { title: 'Shell Fuel Station - Murree Hills', address: 'Jhika Gali Road, Murree', phone: '051-3421100', latitude: 33.9211, longitude: 73.4011 },
    ],
  },
];

async function main() {
  console.log('⛽ Starting Fuel Station Seeding...');

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const { city, pumps } of cityPumps) {
    const destination = await prisma.destination.findFirst({
      where: {
        OR: [
          { city: { contains: city } },
          { title: { contains: city } },
        ],
      },
    });

    if (!destination) {
      console.log(`⚠️  No destination found for city: ${city} — skipping.`);
      continue;
    }

    console.log(`\n✅ Seeding ${pumps.length} fuel stations for ${destination.title}...`);

    for (const pump of pumps) {
      const slug = `fuel-${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${pump.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.substring(0, 190);

      try {
        await prisma.pointOfInterest.upsert({
          where: { slug },
          update: {
            title: pump.title,
            address: pump.address,
            phone: pump.phone,
            latitude: pump.latitude,
            longitude: pump.longitude,
            category: 'Fuel',
            destinationId: destination.id,
          },
          create: {
            title: pump.title,
            slug,
            address: pump.address,
            phone: pump.phone,
            latitude: pump.latitude,
            longitude: pump.longitude,
            category: 'Fuel',
            destinationId: destination.id,
            gallery: JSON.stringify([]),
          },
        });
        console.log(`  ✨ ${pump.title}`);
        totalCreated++;
      } catch (error) {
        console.error(`  ❌ Error seeding ${pump.title}:`, error);
        totalSkipped++;
      }
    }
  }

  console.log(`\n🎉 Done! Seeded ${totalCreated} fuel stations. Skipped ${totalSkipped}.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
